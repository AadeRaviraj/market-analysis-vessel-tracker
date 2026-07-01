from django.contrib.auth import authenticate
from django.db.models import Avg, Count
from rest_framework import viewsets, filters, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Region, Vessel, MarketHireEntry
from .permissions import IsOfficeAdminOrReadOnly
from .serializers import (
    RegionSerializer, VesselSerializer,
    MarketHireEntrySerializer, AggregatedEntrySerializer,
)


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """POST { username, password } -> { token, is_admin, username }"""
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(username=username, password=password)
    if user is None:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        "token": token.key,
        "username": user.username,
        "is_admin": user.is_staff,  # Office Admin flag
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def whoami_view(request):
    return Response({
        "username": request.user.username,
        "is_admin": request.user.is_staff,
    })


# ---------------------------------------------------------------------------
# Reference data
# ---------------------------------------------------------------------------
class RegionViewSet(viewsets.ModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [IsOfficeAdminOrReadOnly]


class VesselViewSet(viewsets.ModelViewSet):
    queryset = Vessel.objects.select_related("region").all()
    serializer_class = VesselSerializer
    permission_classes = [IsOfficeAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]


# ---------------------------------------------------------------------------
# Core daily-entry data
# ---------------------------------------------------------------------------
class MarketHireEntryViewSet(viewsets.ModelViewSet):
    """
    Region-wise view + data entry point.

    - Office Admins: full CRUD (create daily entries, edit, delete).
    - Office Users: read-only (list/retrieve).
    - Filter by region:  /api/entries/?region=<id>
    - Filter by date range: /api/entries/?date_from=2026-06-01&date_to=2026-06-30
    """

    queryset = MarketHireEntry.objects.select_related("region", "vessel", "created_by").all()
    serializer_class = MarketHireEntrySerializer
    permission_classes = [IsOfficeAdminOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        region_id = self.request.query_params.get("region")
        vessel_id = self.request.query_params.get("vessel")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        if region_id:
            qs = qs.filter(region_id=region_id)
        if vessel_id:
            qs = qs.filter(vessel_id=vessel_id)
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        return qs


class AggregatedPerformanceView(APIView):
    """
    GET /api/entries/aggregated/

    Aggregated (all-region) vessel performance, grouped by date, with
    average market rate vs average hire rate. HS codes are intentionally
    NEVER included in this response.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = MarketHireEntry.objects.all()
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)

        grouped = (
            qs.values("date")
            .annotate(
                avg_market_rate=Avg("market_rate"),
                avg_hire_rate=Avg("hire_rate"),
                entry_count=Count("id"),
            )
            .order_by("-date")
        )

        results = []
        for row in grouped:
            row["avg_variance"] = row["avg_hire_rate"] - row["avg_market_rate"]
            results.append(row)

        serializer = AggregatedEntrySerializer(results, many=True)
        return Response(serializer.data)
