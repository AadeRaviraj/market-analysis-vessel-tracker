from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    RegionViewSet, VesselViewSet, MarketHireEntryViewSet,
    AggregatedPerformanceView, login_view, whoami_view,
)

router = DefaultRouter()
router.register(r"regions", RegionViewSet, basename="region")
router.register(r"vessels", VesselViewSet, basename="vessel")
router.register(r"entries", MarketHireEntryViewSet, basename="entry")

urlpatterns = [
    path("auth/login/", login_view, name="login"),
    path("auth/whoami/", whoami_view, name="whoami"),
    path("entries/aggregated/", AggregatedPerformanceView.as_view(), name="entries-aggregated"),
    path("", include(router.urls)),
]
