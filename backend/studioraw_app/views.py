
import json
import csv
from datetime import datetime, timedelta

from django.contrib.auth import (
    authenticate,
    login,
    logout,
    get_user_model,
    update_session_auth_hash,
)
from .permissions import is_admin
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Sum, Count, Q, F, Avg
from django.http import JsonResponse, HttpResponse
from django.utils import timezone
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.views.decorators.http import require_POST
from django.middleware.csrf import get_token

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .permissions import (
    IsERPAdmin,
    IsERPAdminOrStaffReadOnly,
    IsERPAdminOrStaffEditor,
    IsERPNotificationUser,
)

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

from .serializers import (
    CustomerSerializer,
    EnquirySerializer,
    BookingSerializer,
    PaymentSerializer,
    DeliverySerializer,
    WeddingPhotographySerializer,
    WeddingVideographySerializer,
    FunctionArrangementSerializer,
    EventManagementSerializer,
    CustomizedGiftSerializer,
    InventorySerializer,
    EquipmentSerializer,
    ExpenseSerializer,
    StaffSerializer,
    BranchSerializer,
    NotificationSerializer,
    StudioSettingSerializer,
    AdminProfileSerializer,
)


# ==========================================
# CSRF TOKEN API
# ==========================================

@ensure_csrf_cookie
def csrf_token_view(request):
    token = get_token(request)
    return JsonResponse({
        "message": "CSRF cookie set",
        "csrfToken": token
    })


# ==========================================
# CUSTOMERS API
# ==========================================

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by("-created_at")
    serializer_class = CustomerSerializer
    permission_classes = [IsERPAdminOrStaffEditor]


# ==========================================
# ENQUIRIES API
# ==========================================

class EnquiryViewSet(viewsets.ModelViewSet):
    queryset = Enquiry.objects.all().order_by("-created_at")
    serializer_class = EnquirySerializer
    permission_classes = [IsERPAdminOrStaffEditor]


# ==========================================
# BOOKINGS API
# ==========================================

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by("-created_at")
    serializer_class = BookingSerializer
    permission_classes = [IsERPAdminOrStaffEditor]


# ==========================================
# PAYMENTS API
# ==========================================

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by("-created_at")
    serializer_class = PaymentSerializer
    permission_classes = [IsERPAdminOrStaffReadOnly]


# ==========================================
# DELIVERY API
# ==========================================

class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all().order_by("-created_at")
    serializer_class = DeliverySerializer
    permission_classes = [IsERPAdminOrStaffEditor]


# ==========================================
# WEDDING PHOTOGRAPHY API
# ==========================================

class WeddingPhotographyViewSet(viewsets.ModelViewSet):
    queryset = WeddingPhotography.objects.all().order_by("-created_at")
    serializer_class = WeddingPhotographySerializer
    permission_classes = [IsERPAdminOrStaffEditor]


# ==========================================
# WEDDING VIDEOGRAPHY API
# ==========================================

class WeddingVideographyViewSet(viewsets.ModelViewSet):
    queryset = WeddingVideography.objects.all().order_by("-created_at")
    serializer_class = WeddingVideographySerializer
    permission_classes = [IsERPAdminOrStaffEditor]


# ==========================================
# FUNCTIONS WE ARRANGE API
# ==========================================

class FunctionArrangementViewSet(viewsets.ModelViewSet):
    queryset = FunctionArrangement.objects.all().order_by("-created_at")
    serializer_class = FunctionArrangementSerializer
    permission_classes = [IsERPAdminOrStaffEditor]


# ==========================================
# EVENT MANAGEMENT API
# ==========================================

class EventManagementViewSet(viewsets.ModelViewSet):
    queryset = EventManagement.objects.all().order_by("-created_at")
    serializer_class = EventManagementSerializer
    permission_classes = [IsERPAdminOrStaffEditor]


# ==========================================
# CUSTOMIZED GIFTS API
# ==========================================

class CustomizedGiftViewSet(viewsets.ModelViewSet):
    queryset = CustomizedGift.objects.all().order_by("-created_at")
    serializer_class = CustomizedGiftSerializer
    permission_classes = [IsERPAdminOrStaffEditor]


# ==========================================
# EMAIL + PASSWORD LOGIN API
# ==========================================

@require_POST
@csrf_protect
def login_view(request):
    try:
        data = json.loads(request.body)
    except (ValueError, UnicodeDecodeError):
        return JsonResponse(
            {"error": "Invalid JSON"},
            status=400
        )

    identifier = str(
        data.get("username", "") or data.get("email", "")
    ).strip()
    password = data.get("password", "")

    if not identifier or not password:
        return JsonResponse(
            {"error": "Username/Email and password are required"},
            status=400
        )

    User = get_user_model()
    user_match = User.objects.filter(
        Q(email__iexact=identifier) |
        Q(username__iexact=identifier)
    ).first()

    if not user_match:
        return JsonResponse(
            {"error": "Invalid username/email or password"},
            status=401
        )

    user = authenticate(
        request,
        username=user_match.get_username(),
        password=password
    )

    if user is None:
        return JsonResponse(
            {"error": "Invalid username/email or password"},
            status=401
        )

    login(request, user)

    return JsonResponse({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "username": user.get_username(),
            "name": (
                f"{user.first_name} {user.last_name}".strip()
                or user.get_username()
            ),
            "email": user.email,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        }
    })


# ==========================================
# LOGOUT API
# ==========================================

@require_POST
@csrf_protect
def logout_view(request):
    if not request.user.is_authenticated:
        return JsonResponse(
            {"detail": "Authentication required"},
            status=401
        )

    logout(request)

    return JsonResponse({
        "message": "Logout successful"
    })


# ==========================================
# CURRENT LOGGED-IN USER & PROFILE APIS
# ==========================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    user = request.user
    full_name = (
        f"{user.first_name} {user.last_name}".strip()
        or user.get_username()
    )
    role = (
        "Administrator"
        if user.is_superuser
        else ("Staff" if user.is_staff else "User")
    )

    return Response({
        "id": user.id,
        "username": user.get_username(),
        "name": full_name,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": role,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
    })


@api_view(["PATCH", "POST"])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    user = request.user
    data = request.data
    name = data.get("name")
    email = data.get("email")

    if email:
        email = email.strip().lower()
        User = get_user_model()

        if User.objects.filter(
            email__iexact=email
        ).exclude(pk=user.pk).exists():
            return Response(
                {
                    "error": (
                        "This email is already in use "
                        "by another account."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.email = email

    if name:
        parts = name.strip().split(" ", 1)
        user.first_name = parts[0]
        user.last_name = parts[1] if len(parts) > 1 else ""

    user.save()

    full_name = (
        f"{user.first_name} {user.last_name}".strip()
        or user.get_username()
    )
    role = (
        "Administrator"
        if user.is_superuser
        else ("Staff" if user.is_staff else "User")
    )

    return Response({
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "username": user.get_username(),
            "name": full_name,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": role,
        },
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    user = request.user
    current_password = (
        request.data.get("currentPassword")
        or request.data.get("current_password")
    )
    new_password = (
        request.data.get("newPassword")
        or request.data.get("new_password")
    )

    if not current_password or not new_password:
        return Response(
            {
                "error": (
                    "Current password and new password "
                    "are required."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not user.check_password(current_password):
        return Response(
            {"error": "Incorrect current password."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(new_password) < 8:
        return Response(
            {
                "error": (
                    "New password must be at least "
                    "8 characters long."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(new_password)
    user.save()
    update_session_auth_hash(request, user)

    return Response({
        "message": "Password changed successfully."
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password_view(request):
    email = str(request.data.get("email", "")).strip().lower()

    if not email:
        return Response(
            {"error": "Email is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    User = get_user_model()

    user = User.objects.filter(
        email__iexact=email,
        is_active=True,
    ).first()

    if user and user.has_usable_password():
        token = default_token_generator.make_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

        frontend_url = getattr(
            settings,
            "FRONTEND_URL",
            "http://localhost:5173",
        ).rstrip("/")
        reset_url = (
            f"{frontend_url}/"
            f"?reset_uid={uidb64}&reset_token={token}"
        )

        subject = "Studio Raw Picturez - Password Reset"
        message = (
            f"Hello {user.first_name or user.username},\n\n"
            "You requested a password reset for your "
            "Studio Raw Picturez ERP & CRM account.\n\n"
            "Use the link below to reset your password:\n\n"
            f"{reset_url}\n\n"
            "If you did not request this, ignore this email.\n"
        )

        try:
           send_mail(
    subject,
    message,
    settings.DEFAULT_FROM_EMAIL,
    [user.email],
    fail_silently=False,
)
        except Exception:
            logging.getLogger(__name__).exception(
                "Password reset email delivery failed."
            )

    return Response({
        "message": (
            "If an account with that email exists, "
            "password reset instructions have been sent."
        )
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password_view(request):
    uidb64 = (
        request.data.get("uidb64")
        or request.data.get("uid")
    )
    token = request.data.get("token")
    new_password = (
        request.data.get("new_password")
        or request.data.get("newPassword")
    )

    if not uidb64 or not token or not new_password:
        return Response(
            {
                "error": (
                    "User ID, token, and new password "
                    "are required."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    User = get_user_model()

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid, is_active=True)
    except (
        TypeError,
        ValueError,
        OverflowError,
        User.DoesNotExist,
    ):
        user = None

    if (
        user is None
        or not default_token_generator.check_token(user, token)
    ):
        return Response(
            {
                "error": (
                    "The password reset link is invalid "
                    "or has expired."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        validate_password(new_password, user=user)
    except ValidationError as exc:
        return Response(
            {"error": " ".join(exc.messages)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(new_password)
    user.save(update_fields=["password"])

    return Response({
        "message": (
            "Password has been reset successfully. "
            "You can now log in with your new password."
        )
    })

# ==========================================
# INVENTORY API
# ==========================================

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all().order_by("-created_at")
    serializer_class = InventorySerializer
    permission_classes = [IsERPAdminOrStaffEditor]


# ==========================================
# EQUIPMENT API
# ==========================================

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all().order_by("-created_at")
    serializer_class = EquipmentSerializer
    permission_classes = [IsERPAdminOrStaffEditor]


# ==========================================
# EXPENSES API
# ==========================================

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().order_by("-created_at")
    serializer_class = ExpenseSerializer
    permission_classes = [IsERPAdminOrStaffReadOnly]


# ==========================================
# STAFF API
# ==========================================

class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all().order_by("-created_at")
    serializer_class = StaffSerializer
    permission_classes = [IsERPAdmin]


# ==========================================
# BRANCHES API
# ==========================================

class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all().order_by("-created_at")
    serializer_class = BranchSerializer
    permission_classes = [IsERPAdmin]


# ==========================================
# NOTIFICATIONS API
# ==========================================

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by("-created_at")
    serializer_class = NotificationSerializer
    permission_classes = [IsERPNotificationUser]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if is_admin(user):
            qs = qs.filter(
                Q(recipient=user) |
                Q(recipient__isnull=True)
            )
        else:
            qs = qs.filter(recipient=user)

        is_read = self.request.query_params.get("is_read")

        if is_read is not None:
            if is_read.lower() in ["true", "1"]:
                qs = qs.filter(is_read=True)
            elif is_read.lower() in ["false", "0"]:
                qs = qs.filter(is_read=False)

        module = self.request.query_params.get("module")
        if module:
            qs = qs.filter(module__iexact=module)

        priority = self.request.query_params.get("priority")
        if priority:
            qs = qs.filter(priority__iexact=priority)

        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status__iexact=status_param)

        return qs

    @action(
        detail=False,
        methods=["get"],
        url_path="unread-count",
    )
    def unread_count(self, request):
        count = self.get_queryset().filter(
            is_read=False
        ).count()

        return Response({
            "unread_count": count
        })

    @action(
        detail=True,
        methods=["post"],
        url_path="mark-read",
    )
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()

        return Response({
            "message": "Notification marked as read",
            "notification": self.get_serializer(
                notification
            ).data,
        })

    @action(
        detail=False,
        methods=["post"],
        url_path="mark-all-read",
    )
    def mark_all_read(self, request):
        qs = self.get_queryset().filter(
            is_read=False
        )

        updated_count = qs.update(
            is_read=True,
            read_at=timezone.now(),
        )

        return Response({
            "message": "All notifications marked as read",
            "updated_count": updated_count,
        })


# ==========================================
# SETTINGS API
# ==========================================

@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsERPAdmin])
def studio_settings_view(request):
    setting = StudioSetting.objects.first()

    if not setting:
        setting = StudioSetting.objects.create()

    if request.method == "GET":
        serializer = StudioSettingSerializer(setting)
        return Response(serializer.data)

    serializer = StudioSettingSerializer(
        setting,
        data=request.data,
        partial=True,
    )

    if serializer.is_valid():
        serializer.save()

        return Response({
            "message": "Settings updated successfully",
            "data": serializer.data,
        })

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


# ==========================================
# DASHBOARD API
# ==========================================
@api_view(["GET"])
@permission_classes([IsERPAdmin])
def dashboard_stats_view(request):
    total_customers = Customer.objects.count()
    total_enquiries = Enquiry.objects.count()
    total_bookings = Booking.objects.count()

    total_payments_received = (
        Payment.objects.aggregate(
            total=Sum("paid_amount")
        )["total"] or 0
    )

    total_contracted_revenue = (
        Payment.objects.aggregate(
            total=Sum("total_amount")
        )["total"] or 0
    )

    pending_payment_balance = max(
        0,
        total_contracted_revenue - total_payments_received,
    )

    wedding_photography_orders = WeddingPhotography.objects.count()
    wedding_videography_orders = WeddingVideography.objects.count()

    pending_deliveries = Delivery.objects.exclude(
        status__in=["Delivered", "Cancelled"]
    ).count()

    total_expenses = (
        Expense.objects.aggregate(
            total=Sum("amount")
        )["total"] or 0
    )

    inventory_alerts = Inventory.objects.filter(
        quantity__lte=F("minimum_stock")
    ).count()

    now = timezone.now().date()

    upcoming_bookings = Booking.objects.filter(
        event_date__gte=now
    ).order_by("event_date")[:6]

    upcoming_events = [
        {
            "id": b.id,
            "title": (
                f"{b.customer_name} - "
                f"{b.event_type or 'Event'}"
            ),
            "date": (
                str(b.event_date)
                if b.event_date
                else "TBD"
            ),
            "location": b.location or "Studio",
            "status": b.status,
            "total_amount": float(b.total_amount),
        }
        for b in upcoming_bookings
    ]

    recent_activities = []

    for p in Payment.objects.order_by("-created_at")[:5]:
        recent_activities.append({
            "id": f"pay-{p.id}",
            "type": "payment",
            "title": (
                f"Payment received from {p.customer_name}"
            ),
            "description": (
                f"₹{p.paid_amount:,.2f} via "
                f"{p.payment_method} ({p.status})"
            ),
            "time": (
                p.created_at.isoformat()
                if p.created_at
                else None
            ),
        })

    for b in Booking.objects.order_by("-created_at")[:5]:
        recent_activities.append({
            "id": f"book-{b.id}",
            "type": "booking",
            "title": f"Booking for {b.customer_name}",
            "description": (
                f"{b.event_type} on "
                f"{b.event_date or 'TBD'} ({b.status})"
            ),
            "time": (
                b.created_at.isoformat()
                if b.created_at
                else None
            ),
        })

    for e in Enquiry.objects.order_by("-created_at")[:5]:
        recent_activities.append({
            "id": f"enq-{e.id}",
            "type": "enquiry",
            "title": f"New enquiry from {e.name}",
            "description": (
                f"{e.event_type} ({e.status})"
            ),
            "time": (
                e.created_at.isoformat()
                if e.created_at
                else None
            ),
        })

    recent_activities.sort(
        key=lambda x: x["time"] or "",
        reverse=True,
    )
    recent_activities = recent_activities[:8]

    monthly_trends = []

    for i in range(5, -1, -1):
        target_month_date = (
            now.replace(day=1)
            - timedelta(days=i * 28)
        ).replace(day=1)

        next_month_date = (
            target_month_date + timedelta(days=32)
        ).replace(day=1)

        month_label = target_month_date.strftime("%b %Y")

        month_rev = (
            Payment.objects.filter(
                payment_date__gte=target_month_date,
                payment_date__lt=next_month_date,
            ).aggregate(
                total=Sum("paid_amount")
            )["total"] or 0
        )

        month_exp = (
            Expense.objects.filter(
                expense_date__gte=target_month_date,
                expense_date__lt=next_month_date,
            ).aggregate(
                total=Sum("amount")
            )["total"] or 0
        )

        monthly_trends.append({
            "month": month_label,
            "revenue": float(month_rev),
            "expenses": float(month_exp),
        })

    return Response({
        "total_customers": total_customers,
        "total_enquiries": total_enquiries,
        "total_bookings": total_bookings,
        "total_payments_received": float(
            total_payments_received
        ),
        "total_contracted_revenue": float(
            total_contracted_revenue
        ),
        "pending_payment_balance": float(
            pending_payment_balance
        ),
        "wedding_photography_orders": (
            wedding_photography_orders
        ),
        "wedding_videography_orders": (
            wedding_videography_orders
        ),
        "pending_deliveries": pending_deliveries,
        "total_expenses": float(total_expenses),
        "inventory_alerts": inventory_alerts,
        "upcoming_events": upcoming_events,
        "recent_activities": recent_activities,
        "monthly_trends": monthly_trends,
    })


# ==========================================
# REPORTS API
# ==========================================

@api_view(["GET"])
@permission_classes([IsERPAdmin])
def reports_summary_view(request):
    start_date = request.query_params.get("start_date")
    end_date = request.query_params.get("end_date")

    booking_filter = Q()
    payment_filter = Q()
    expense_filter = Q()
    enquiry_filter = Q()
    customer_filter = Q()

    if start_date:
        booking_filter &= Q(event_date__gte=start_date)
        payment_filter &= Q(payment_date__gte=start_date)
        expense_filter &= Q(expense_date__gte=start_date)
        enquiry_filter &= Q(event_date__gte=start_date)
        customer_filter &= Q(
            created_at__date__gte=start_date
        )

    if end_date:
        booking_filter &= Q(event_date__lte=end_date)
        payment_filter &= Q(payment_date__lte=end_date)
        expense_filter &= Q(expense_date__lte=end_date)
        enquiry_filter &= Q(event_date__lte=end_date)
        customer_filter &= Q(
            created_at__date__lte=end_date
        )

    total_customers = Customer.objects.filter(
        customer_filter
    ).count()

    enquiry_qs = Enquiry.objects.filter(enquiry_filter)
    total_enquiries = enquiry_qs.count()

    converted_enquiries = enquiry_qs.filter(
        status__in=["Won", "Converted"]
    ).count()

    lost_enquiries = enquiry_qs.filter(
        status="Lost"
    ).count()

    conversion_rate = (
        round(
            converted_enquiries / total_enquiries * 100,
            1,
        )
        if total_enquiries > 0
        else 0
    )

    booking_qs = Booking.objects.filter(booking_filter)
    total_bookings = booking_qs.count()

    confirmed_bookings = booking_qs.filter(
        status="Confirmed"
    ).count()

    pending_bookings = booking_qs.filter(
        status="Pending"
    ).count()

    completed_bookings = booking_qs.filter(
        status="Completed"
    ).count()

    cancelled_bookings = booking_qs.filter(
        status="Cancelled"
    ).count()

    payment_qs = Payment.objects.filter(payment_filter)

    total_payments_received = (
        payment_qs.aggregate(
            total=Sum("paid_amount")
        )["total"] or 0
    )

    total_contracted_revenue = (
        payment_qs.aggregate(
            total=Sum("total_amount")
        )["total"] or 0
    )

    pending_payment_balance = max(
        0,
        total_contracted_revenue - total_payments_received,
    )

    expense_qs = Expense.objects.filter(expense_filter)

    total_expenses = (
        expense_qs.aggregate(
            total=Sum("amount")
        )["total"] or 0
    )

    net_profit = (
        total_payments_received - total_expenses
    )

    total_deliveries = Delivery.objects.count()

    pending_deliveries = Delivery.objects.filter(
        status="Pending"
    ).count()

    dispatched_deliveries = Delivery.objects.filter(
        status="Dispatched"
    ).count()

    completed_deliveries = Delivery.objects.filter(
        status="Delivered"
    ).count()

    wedding_photo_count = WeddingPhotography.objects.count()
    wedding_video_count = WeddingVideography.objects.count()
    functions_count = FunctionArrangement.objects.count()
    events_count = EventManagement.objects.count()
    gifts_count = CustomizedGift.objects.count()

    payment_methods = list(
        payment_qs.values("payment_method")
        .annotate(
            total=Sum("paid_amount"),
            count=Count("id"),
        )
        .order_by("-total")
    )

    expense_categories = list(
        expense_qs.values("category")
        .annotate(
            total=Sum("amount"),
            count=Count("id"),
        )
        .order_by("-total")
    )

    return Response({
        "customers": {
            "total": total_customers,
        },
        "enquiries": {
            "total": total_enquiries,
            "converted": converted_enquiries,
            "lost": lost_enquiries,
            "conversion_rate": conversion_rate,
        },
        "bookings": {
            "total": total_bookings,
            "confirmed": confirmed_bookings,
            "pending": pending_bookings,
            "completed": completed_bookings,
            "cancelled": cancelled_bookings,
        },
        "payments": {
            "total_received": float(
                total_payments_received
            ),
            "contracted_total": float(
                total_contracted_revenue
            ),
            "pending_balance": float(
                pending_payment_balance
            ),
            "method_breakdown": payment_methods,
        },
        "expenses": {
            "total": float(total_expenses),
            "category_breakdown": expense_categories,
        },
        "net_profit": float(net_profit),
        "deliveries": {
            "total": total_deliveries,
            "pending": pending_deliveries,
            "dispatched": dispatched_deliveries,
            "completed": completed_deliveries,
        },
        "events": {
            "wedding_photography": wedding_photo_count,
            "wedding_videography": wedding_video_count,
            "functions_we_arrange": functions_count,
            "event_management": events_count,
            "customized_gifts": gifts_count,
        },
    })


# ==========================================
# REPORTS CSV EXPORT API
# ==========================================

@api_view(["GET"])
@permission_classes([IsERPAdmin])
def export_reports_csv_view(request):
    report_type = request.query_params.get(
        "type",
        "summary",
    )

    response = HttpResponse(
        content_type="text/csv"
    )

    response["Content-Disposition"] = (
        f'attachment; filename="studio_raw_'
        f'{report_type}_report.csv"'
    )

    writer = csv.writer(response)

    if report_type == "payments":
        writer.writerow([
            "ID",
            "Customer Name",
            "Total Amount",
            "Paid Amount",
            "Payment Method",
            "Payment Date",
            "Status",
            "Transaction ID",
        ])

        for p in Payment.objects.all().order_by(
            "-created_at"
        ):
            writer.writerow([
                p.id,
                p.customer_name,
                p.total_amount,
                p.paid_amount,
                p.payment_method,
                p.payment_date,
                p.status,
                p.transaction_id,
            ])

    elif report_type == "expenses":
        writer.writerow([
            "ID",
            "Title",
            "Category",
            "Amount",
            "Expense Date",
            "Paid To",
            "Payment Method",
            "Status",
        ])

        for ex in Expense.objects.all().order_by(
            "-created_at"
        ):
            writer.writerow([
                ex.id,
                ex.expense_title,
                ex.category,
                ex.amount,
                ex.expense_date,
                ex.paid_to,
                ex.payment_method,
                ex.status,
            ])

    elif report_type == "bookings":
        writer.writerow([
            "ID",
            "Customer Name",
            "Event Type",
            "Event Date",
            "Location",
            "Total Amount",
            "Advance Amount",
            "Status",
        ])

        for b in Booking.objects.all().order_by(
            "-created_at"
        ):
            writer.writerow([
                b.id,
                b.customer_name,
                b.event_type,
                b.event_date,
                b.location,
                b.total_amount,
                b.advance_amount,
                b.status,
            ])

    elif report_type == "customers":
        writer.writerow([
            "ID",
            "Name",
            "Phone",
            "Email",
            "Event Type",
            "Address",
            "Created At",
        ])

        for c in Customer.objects.all().order_by(
            "-created_at"
        ):
            writer.writerow([
                c.id,
                c.name,
                c.phone,
                c.email,
                c.event_type,
                c.address,
                c.created_at,
            ])

    elif report_type == "enquiries":
        writer.writerow([
            "ID",
            "Name",
            "Phone",
            "Email",
            "Event Type",
            "Event Date",
            "Budget",
            "Status",
        ])

        for en in Enquiry.objects.all().order_by(
            "-created_at"
        ):
            writer.writerow([
                en.id,
                en.name,
                en.phone,
                en.email,
                en.event_type,
                en.event_date,
                en.budget,
                en.status,
            ])

    else:
        writer.writerow([
            "Category",
            "Metric",
            "Value",
        ])

        writer.writerow([
            "Customers",
            "Total Customers",
            Customer.objects.count(),
        ])

        writer.writerow([
            "Enquiries",
            "Total Enquiries",
            Enquiry.objects.count(),
        ])

        writer.writerow([
            "Bookings",
            "Total Bookings",
            Booking.objects.count(),
        ])

        total_rec = (
            Payment.objects.aggregate(
                total=Sum("paid_amount")
            )["total"] or 0
        )

        total_exp = (
            Expense.objects.aggregate(
                total=Sum("amount")
            )["total"] or 0
        )

        writer.writerow([
            "Financials",
            "Total Payments Received",
            float(total_rec),
        ])

        writer.writerow([
            "Financials",
            "Total Expenses",
            float(total_exp),
        ])

        writer.writerow([
            "Financials",
            "Net Profit",
            float(total_rec - total_exp),
        ])

    return response
