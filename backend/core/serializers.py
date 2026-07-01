from rest_framework import serializers
from .models import Region, Vessel, MarketHireEntry


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ["id", "name", "code"]


class VesselSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source="region.name", read_only=True)

    class Meta:
        model = Vessel
        fields = ["id", "name", "imo_number", "region", "region_name"]


class MarketHireEntrySerializer(serializers.ModelSerializer):
    """Full serializer - used for data entry (Admin) and region-wise view.

    Includes hs_code, exactly as required for the region-level screen.
    """

    region_name = serializers.CharField(source="region.name", read_only=True)
    vessel_name = serializers.CharField(source="vessel.name", read_only=True)
    variance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = MarketHireEntry
        fields = [
            "id", "date", "region", "region_name", "vessel", "vessel_name",
            "hs_code", "market_rate", "hire_rate", "variance",
            "created_by_username", "created_at", "updated_at",
        ]
        read_only_fields = ["created_by"]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            validated_data["created_by"] = request.user
        return super().create(validated_data)


class AggregatedEntrySerializer(serializers.Serializer):
    """
    Aggregated (all-region) view.

    HS code is deliberately NOT included here, per requirement:
      "aggregated vessel performance with daily comparisons of market
       rates and hire rates (HS codes will not be displayed)."
    """

    date = serializers.DateField()
    avg_market_rate = serializers.DecimalField(max_digits=12, decimal_places=2)
    avg_hire_rate = serializers.DecimalField(max_digits=12, decimal_places=2)
    avg_variance = serializers.DecimalField(max_digits=12, decimal_places=2)
    entry_count = serializers.IntegerField()
