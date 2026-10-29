
from rest_framework import serializers

from django.contrib.auth import get_user_model
from .models import (
    Customer,
    Enquiry,
    Booking,
    Payment,
    Delivery,
    WeddingPhotography,
    WeddingVideography,
    FunctionArrangement,
    EventManagement,
    CustomizedGift,
    Inventory,
    Equipment,
    Expense,
    Staff,
    Branch,
    Notification,
    StudioSetting,
)

User = get_user_model()


# ==========================================
# CUSTOMERS SERIALIZER
# ==========================================

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


# ==========================================
# ENQUIRIES SERIALIZER
# ==========================================

class EnquirySerializer(serializers.ModelSerializer):
    status = serializers.CharField(required=False, allow_blank=True, default="New")

    class Meta:
        model = Enquiry
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


# ==========================================
# BOOKINGS SERIALIZER
# ==========================================

class BookingSerializer(serializers.ModelSerializer):
    status = serializers.CharField(required=False, allow_blank=True, default="Pending")

    class Meta:
        model = Booking
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


# ==========================================
# PAYMENTS SERIALIZER
# ==========================================

class PaymentSerializer(serializers.ModelSerializer):
    status = serializers.CharField(required=False, allow_blank=True, default="Pending")
    payment_method = serializers.CharField(required=False, allow_blank=True, default="Cash")

    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


# ==========================================
# DELIVERY SERIALIZER
# ==========================================

class DeliverySerializer(serializers.ModelSerializer):
    status = serializers.CharField(required=False, allow_blank=True, default="Pending")
    payment_status = serializers.CharField(required=False, allow_blank=True, default="Pending")

    class Meta:
        model = Delivery
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


# ==========================================
# WEDDING PHOTOGRAPHY SERIALIZER
# ==========================================

class WeddingPhotographySerializer(serializers.ModelSerializer):
    service_type = serializers.CharField(required=False, allow_blank=True, default="Traditional")
    status = serializers.CharField(required=False, allow_blank=True, default="Pending")

    class Meta:
        model = WeddingPhotography
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


# ==========================================
# WEDDING VIDEOGRAPHY SERIALIZER
# ==========================================

class WeddingVideographySerializer(serializers.ModelSerializer):
    service_type = serializers.CharField(required=False, allow_blank=True, default="Traditional")
    status = serializers.CharField(required=False, allow_blank=True, default="Pending")

    class Meta:
        model = WeddingVideography
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


# ==========================================
# FUNCTIONS WE ARRANGE SERIALIZER
# ==========================================

class FunctionArrangementSerializer(serializers.ModelSerializer):
    status = serializers.CharField(required=False, allow_blank=True, default="Pending")

    class Meta:
        model = FunctionArrangement
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


# ==========================================
# EVENT MANAGEMENT SERIALIZER
# ==========================================

class EventManagementSerializer(serializers.ModelSerializer):
    status = serializers.CharField(required=False, allow_blank=True, default="Pending")

    class Meta:
        model = EventManagement
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


# ==========================================
# CUSTOMIZED GIFTS SERIALIZER
# ==========================================

class CustomizedGiftSerializer(serializers.ModelSerializer):
    status = serializers.CharField(required=False, allow_blank=True, default="Pending")
    payment_status = serializers.CharField(required=False, allow_blank=True, default="Pending")

    class Meta:
        model = CustomizedGift
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]

# ==========================================
# INVENTORY SERIALIZER
# ==========================================

class InventorySerializer(serializers.ModelSerializer):
    status = serializers.CharField(required=False, allow_blank=True, default="Available")

    class Meta:
        model = Inventory
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


# ==========================================
# EQUIPMENT SERIALIZER
# ==========================================

class EquipmentSerializer(serializers.ModelSerializer):
    status = serializers.CharField(required=False, allow_blank=True, default="Available")

    class Meta:
        model = Equipment
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


# ==========================================
# EXPENSES SERIALIZER
# ==========================================

class ExpenseSerializer(serializers.ModelSerializer):
    status = serializers.CharField(required=False, allow_blank=True, default="Pending")
    payment_method = serializers.CharField(required=False, allow_blank=True, default="Cash")

    class Meta:
        model = Expense
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


# ==========================================
# STAFF SERIALIZER
# ==========================================

class StaffSerializer(serializers.ModelSerializer):
    status = serializers.CharField(required=False, allow_blank=True, default="Active")

    class Meta:
        model = Staff
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


# ==========================================
# BRANCHES SERIALIZER
# ==========================================

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


# ==========================================
# NOTIFICATIONS SERIALIZER
# ==========================================

class NotificationSerializer(serializers.ModelSerializer):
    status = serializers.CharField(required=False, allow_blank=True, default="Pending")
    priority = serializers.CharField(required=False, allow_blank=True, default="Medium")

    class Meta:
        model = Notification
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


# ==========================================
# STUDIO SETTINGS SERIALIZER
# ==========================================

class StudioSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudioSetting
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


# ==========================================
# ADMIN PROFILE SERIALIZER
# ==========================================

class AdminProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_staff", "is_superuser"]
        read_only_fields = ["id", "is_staff", "is_superuser"]
