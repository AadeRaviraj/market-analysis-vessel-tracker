from django.contrib import admin
from .models import Region, Vessel, MarketHireEntry


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ("name", "code")
    search_fields = ("name", "code")


@admin.register(Vessel)
class VesselAdmin(admin.ModelAdmin):
    list_display = ("name", "region", "imo_number")
    list_filter = ("region",)
    search_fields = ("name",)


@admin.register(MarketHireEntry)
class MarketHireEntryAdmin(admin.ModelAdmin):
    list_display = ("date", "region", "vessel", "hs_code", "market_rate", "hire_rate", "created_by")
    list_filter = ("region", "date")
    search_fields = ("vessel__name", "hs_code")
    date_hierarchy = "date"
