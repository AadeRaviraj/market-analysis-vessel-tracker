import random
from datetime import timedelta, date

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from core.models import Region, Vessel, MarketHireEntry

class Command(BaseCommand):
    help = "Seeds the database with demo users, regions, vessels and daily entries."

    def handle(self, *args, **options):
        # --- Users -----------------------------------------------------
        admin_user, created = User.objects.get_or_create(
            username="admin", defaults={"is_staff": True, "is_superuser": True}
        )
        if created:
            admin_user.set_password("admin123")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created admin user -> admin / admin123"))

        normal_user, created = User.objects.get_or_create(
            username="officeuser", defaults={"is_staff": False}
        )
        if created:
            normal_user.set_password("user123")
            normal_user.save()
            self.stdout.write(self.style.SUCCESS("Created office user -> officeuser / user123"))

        # --- Regions -----------------------------------------------------
        regions_data = [
            ("Middle East Gulf", "MEG"),
            ("US Gulf", "USG"),
            ("Singapore", "SPO"),
            ("West Africa", "WAF"),
        ]
        regions = []
        for name, code in regions_data:
            region, _ = Region.objects.get_or_create(name=name, defaults={"code": code})
            regions.append(region)

        # --- Vessels -----------------------------------------------------
        vessel_names = [
            "MT Ocean Pearl", "MT Sea Falcon", "MT Star Voyager", "MT Blue Horizon",
            "MT Golden Wave", "MT Coral Express", "MT Silver Trader", "MT North Star",
        ]
        vessels = []
        for i, vname in enumerate(vessel_names):
            region = regions[i % len(regions)]
            vessel, _ = Vessel.objects.get_or_create(
                name=vname, defaults={"region": region, "imo_number": f"IMO{9000000 + i}"}
            )
            vessels.append(vessel)

        # --- Daily entries (last 14 days) --------------------------------
        hs_codes = ["2709.00", "2710.19", "2711.11", "2711.21"]
        today = date.today()
        created_count = 0
        for day_offset in range(14):
            entry_date = today - timedelta(days=day_offset)
            for vessel in vessels:
                base_market = random.uniform(18000, 32000)
                market_rate = round(base_market, 2)
                hire_rate = round(base_market * random.uniform(0.92, 1.12), 2)
                _, was_created = MarketHireEntry.objects.get_or_create(
                    date=entry_date,
                    vessel=vessel,
                    defaults={
                        "region": vessel.region,
                        "hs_code": random.choice(hs_codes),
                        "market_rate": market_rate,
                        "hire_rate": hire_rate,
                        "created_by": admin_user,
                    },
                )
                if was_created:
                    created_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Seed complete: {len(regions)} regions, {len(vessels)} vessels, "
            f"{created_count} new daily entries."
        ))
