from django.db import models
from django.contrib.auth.models import User


class Region(models.Model):
    """A geographical / trading region, e.g. 'Middle East Gulf', 'US Gulf'."""

    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True, help_text="Short region code, e.g. MEG")

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Vessel(models.Model):
    """A vessel that belongs to (operates primarily in) a region."""

    name = models.CharField(max_length=150)
    imo_number = models.CharField(max_length=20, blank=True, null=True, unique=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name="vessels")

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.region.code})"


class MarketHireEntry(models.Model):
    """
    The core daily-entry record.

    One row = "On <date>, for <vessel> operating in <region>, the market
    rate was X and the actual hire rate was Y."  HS code is captured for
    region-level reporting but intentionally excluded from aggregated
    (all-region) reporting, per business requirement.
    """

    date = models.DateField(db_index=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name="entries")
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name="entries")
    hs_code = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Harmonised System code for the cargo/commodity. Region view only.",
    )
    market_rate = models.DecimalField(max_digits=12, decimal_places=2)
    hire_rate = models.DecimalField(max_digits=12, decimal_places=2)

    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="entries")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date"]
        # one entry per vessel per day (adjust if multiple entries/day are needed)
        unique_together = ("date", "vessel")

    def __str__(self):
        return f"{self.date} | {self.vessel.name} | market={self.market_rate} hire={self.hire_rate}"

    @property
    def variance(self):
        """Positive => hire rate above market (good for owner)."""
        return self.hire_rate - self.market_rate
