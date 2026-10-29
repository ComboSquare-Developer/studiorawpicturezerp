
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CustomerViewSet,
    EnquiryViewSet,
    BookingViewSet,
    PaymentViewSet,
    DeliveryViewSet,
    WeddingPhotographyViewSet,
    WeddingVideographyViewSet,
    FunctionArrangementViewSet,
    EventManagementViewSet,
    CustomizedGiftViewSet,
    InventoryViewSet,
    EquipmentViewSet,
    ExpenseViewSet,
    StaffViewSet,
    BranchViewSet,
    NotificationViewSet,
    studio_settings_view,
    dashboard_stats_view,
    reports_summary_view,
    export_reports_csv_view,
)


# ==========================================
# API ROUTER
# ==========================================

router = DefaultRouter()

# Customers API
router.register(
    "customers",
    CustomerViewSet,
    basename="customers"
)

# Enquiries API
router.register(
    "enquiries",
    EnquiryViewSet,
    basename="enquiries"
)

# Bookings API
router.register(
    "bookings",
    BookingViewSet,
    basename="bookings"
)

# Payments API
router.register(
    "payments",
    PaymentViewSet,
    basename="payments"
)

# Delivery API
router.register(
    "deliveries",
    DeliveryViewSet,
    basename="deliveries"
)

# Wedding Photography API
router.register(
    "wedding-photography",
    WeddingPhotographyViewSet,
    basename="wedding-photography"
)

# Wedding Videography API
router.register(
    "wedding-videography",
    WeddingVideographyViewSet,
    basename="wedding-videography"
)

# Functions We Arrange API
router.register(
    "functions-we-arrange",
    FunctionArrangementViewSet,
    basename="functions-we-arrange"
)

# Event Management API
router.register(
    "event-management",
    EventManagementViewSet,
    basename="event-management"
)

# Customized Gifts API
router.register(
    "customized-gifts",
    CustomizedGiftViewSet,
    basename="customized-gifts"
)

# ==========================================
# INVENTORY API
# ==========================================

router.register(
    "inventory",
    InventoryViewSet,
    basename="inventory"
)


# ==========================================
# EQUIPMENT API
# ==========================================

router.register(
    "equipment",
    EquipmentViewSet,
    basename="equipment"
)


# ==========================================
# EXPENSES API
# ==========================================

router.register(
    "expenses",
    ExpenseViewSet,
    basename="expenses"
)


# ==========================================
# STAFF API
# ==========================================

router.register(
    "staff",
    StaffViewSet,
    basename="staff"
)


# ==========================================
# BRANCHES API
# ==========================================

router.register(
    "branches",
    BranchViewSet,
    basename="branches"
)

# Notifications API
router.register(
    "notifications",
    NotificationViewSet,
    basename="notifications"
)


# ==========================================
# API URL PATTERNS
# ==========================================

urlpatterns = [
    path("settings/", studio_settings_view, name="studio-settings"),
    path("dashboard/stats/", dashboard_stats_view, name="dashboard-stats"),
    path("reports/summary/", reports_summary_view, name="reports-summary"),
    path("reports/export-csv/", export_reports_csv_view, name="reports-export-csv"),
    path("", include(router.urls)),
]
