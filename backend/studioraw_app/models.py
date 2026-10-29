
from django.db import models
from django.conf import settings


# ==========================================
# CUSTOMERS MODEL
# ==========================================

class Customer(models.Model):
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    event_type = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


# ==========================================
# ENQUIRIES MODEL
# ==========================================

class Enquiry(models.Model):
    STATUS_CHOICES = [
        ("New", "New"),
        ("Contacted", "Contacted"),
        ("Follow Up", "Follow Up"),
        ("Won", "Won"),
        ("Converted", "Converted"),
        ("Lost", "Lost"),
    ]

    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="enquiries",
    )

    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    event_type = models.CharField(max_length=100, blank=True)
    event_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)

    budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="New",
    )

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


# ==========================================
# BOOKINGS MODEL
# ==========================================

class Booking(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Confirmed", "Confirmed"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    ]

    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bookings",
    )

    customer_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    event_type = models.CharField(max_length=100, blank=True)
    event_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    advance_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="Pending",
    )

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.customer_name


# ==========================================
# PAYMENTS MODEL
# ==========================================

class Payment(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Partial", "Partial"),
        ("Paid", "Paid"),
        ("Refunded", "Refunded"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("Cash", "Cash"),
        ("UPI", "UPI"),
        ("Bank Transfer", "Bank Transfer"),
        ("Card", "Card"),
        ("Other", "Other"),
    ]

    booking = models.ForeignKey(
        Booking,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )

    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )

    customer_name = models.CharField(max_length=150)

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    paid_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    payment_method = models.CharField(
        max_length=30,
        choices=PAYMENT_METHOD_CHOICES,
        default="Cash",
    )

    payment_date = models.DateField(null=True, blank=True)

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="Pending",
    )

    transaction_id = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.customer_name


# ==========================================
# DELIVERY MODEL
# ==========================================

class Delivery(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Packed", "Packed"),
        ("Dispatched", "Dispatched"),
        ("Delivered", "Delivered"),
        ("Cancelled", "Cancelled"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Partial", "Partial"),
        ("Paid", "Paid"),
    ]

    booking = models.ForeignKey(
        Booking,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="deliveries",
    )

    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="deliveries",
    )

    customer_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    item_name = models.CharField(max_length=150)
    quantity = models.PositiveIntegerField(default=1)
    delivery_date = models.DateField(null=True, blank=True)

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="Pending",
    )

    payment_status = models.CharField(
        max_length=30,
        choices=PAYMENT_STATUS_CHOICES,
        default="Pending",
    )

    tracking_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.customer_name} - {self.item_name}"


# ==========================================
# WEDDING PHOTOGRAPHY MODEL
# ==========================================

class WeddingPhotography(models.Model):
    SERVICE_CHOICES = [
        ("Traditional", "Traditional"),
        ("Candid", "Candid"),
        ("Helicam (Drone)", "Helicam (Drone)"),
        ("PreWedding", "PreWedding"),
        ("Post Wedding", "Post Wedding"),
        ("Custom Package", "Custom Package"),
    ]

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Confirmed", "Confirmed"),
        ("In Progress", "In Progress"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    ]

    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="wedding_photography",
    )

    booking = models.ForeignKey(
        Booking,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="wedding_photography",
    )

    customer_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    bride_name = models.CharField(max_length=150, blank=True)
    groom_name = models.CharField(max_length=150, blank=True)

    service_type = models.CharField(
        max_length=50,
        choices=SERVICE_CHOICES,
        default="Traditional",
    )

    event_date = models.DateField(null=True, blank=True)
    event_location = models.CharField(max_length=255, blank=True)

    package_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    advance_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="Pending",
    )

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.customer_name} - {self.service_type}"


# ==========================================
# WEDDING VIDEOGRAPHY MODEL
# ==========================================

class WeddingVideography(models.Model):
    SERVICE_CHOICES = [
        ("Traditional", "Traditional"),
        ("Cinematic", "Cinematic"),
        ("Candid", "Candid"),
        ("Drone", "Drone"),
        ("Pre Wedding", "Pre Wedding"),
        ("Post Wedding", "Post Wedding"),
        ("Custom Package", "Custom Package"),
    ]

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Confirmed", "Confirmed"),
        ("In Progress", "In Progress"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    ]

    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="wedding_videography",
    )

    booking = models.ForeignKey(
        Booking,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="wedding_videography",
    )

    customer_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    bride_name = models.CharField(max_length=150, blank=True)
    groom_name = models.CharField(max_length=150, blank=True)

    service_type = models.CharField(
        max_length=50,
        choices=SERVICE_CHOICES,
        default="Traditional",
    )

    event_date = models.DateField(null=True, blank=True)
    event_location = models.CharField(max_length=255, blank=True)

    package_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    advance_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="Pending",
    )

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.customer_name} - {self.service_type}"


# ==========================================
# FUNCTIONS WE ARRANGE MODEL
# ==========================================

class FunctionArrangement(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Confirmed", "Confirmed"),
        ("In Progress", "In Progress"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    ]

    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="function_arrangements",
    )

    booking = models.ForeignKey(
        Booking,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="function_arrangements",
    )

    customer_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    function_type = models.CharField(max_length=150)
    event_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    guest_count = models.PositiveIntegerField(default=0)

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    advance_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="Pending",
    )

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.customer_name} - {self.function_type}"


# ==========================================
# EVENT MANAGEMENT MODEL
# ==========================================

class EventManagement(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Confirmed", "Confirmed"),
        ("In Progress", "In Progress"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    ]

    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="managed_events",
    )

    booking = models.ForeignKey(
        Booking,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="managed_events",
    )

    customer_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    event_name = models.CharField(max_length=150)
    event_type = models.CharField(max_length=150, blank=True)
    event_date = models.DateField(null=True, blank=True)
    venue = models.CharField(max_length=255, blank=True)
    guest_count = models.PositiveIntegerField(default=0)

    budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    advance_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="Pending",
    )

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.customer_name} - {self.event_name}"


# ==========================================
# CUSTOMIZED GIFTS MODEL
# ==========================================

class CustomizedGift(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Processing", "Processing"),
        ("Ready", "Ready"),
        ("Delivered", "Delivered"),
        ("Cancelled", "Cancelled"),
    ]
    PAYMENT_STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Partial", "Partial"),
        ("Paid", "Paid"),
    ]
    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="customized_gifts",
    )
    booking = models.ForeignKey(
        Booking,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="customized_gifts",
    )
    customer_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    gift_name = models.CharField(max_length=150)
    gift_type = models.CharField(max_length=150, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    order_date = models.DateField(null=True, blank=True)
    delivery_date = models.DateField(null=True, blank=True)
    delivery_address = models.TextField(blank=True)
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )
    advance_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="Pending",
    )

    payment_status = models.CharField(
        max_length=30,
        choices=PAYMENT_STATUS_CHOICES,
        default="Pending",
    )

    customization_details = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.customer_name} - {self.gift_name}"

# ==========================================
# INVENTORY MODEL
# ==========================================

class Inventory(models.Model):
    STATUS_CHOICES = [
        ("Available", "Available"),
        ("Low Stock", "Low Stock"),
        ("Out of Stock", "Out of Stock"),
        ("Discontinued", "Discontinued"),
    ]

    item_name = models.CharField(max_length=150)
    category = models.CharField(max_length=100, blank=True)
    sku = models.CharField(max_length=100, blank=True)
    quantity = models.PositiveIntegerField(default=0)
    minimum_stock = models.PositiveIntegerField(default=5)
    unit = models.CharField(max_length=50, default="Pieces")

    purchase_price = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )
    selling_price = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )

    supplier = models.CharField(max_length=150, blank=True)
    storage_location = models.CharField(max_length=255, blank=True)
    purchase_date = models.DateField(null=True, blank=True)

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="Available",
    )

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.item_name


# ==========================================
# EQUIPMENT MODEL
# ==========================================

class Equipment(models.Model):
    STATUS_CHOICES = [
        ("Available", "Available"),
        ("In Use", "In Use"),
        ("Maintenance", "Maintenance"),
        ("Damaged", "Damaged"),
        ("Retired", "Retired"),
    ]

    equipment_name = models.CharField(max_length=150)
    equipment_type = models.CharField(max_length=100, blank=True)
    brand = models.CharField(max_length=100, blank=True)
    model_number = models.CharField(max_length=100, blank=True)
    serial_number = models.CharField(max_length=150, blank=True)

    purchase_date = models.DateField(null=True, blank=True)
    purchase_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )

    assigned_to = models.CharField(max_length=150, blank=True)
    location = models.CharField(max_length=255, blank=True)
    next_maintenance_date = models.DateField(null=True, blank=True)

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="Available",
    )

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.equipment_name


# ==========================================
# EXPENSES MODEL
# ==========================================

class Expense(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ("Cash", "Cash"),
        ("UPI", "UPI"),
        ("Bank Transfer", "Bank Transfer"),
        ("Card", "Card"),
        ("Other", "Other"),
    ]

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Paid", "Paid"),
        ("Rejected", "Rejected"),
    ]

    expense_title = models.CharField(max_length=150)
    category = models.CharField(max_length=100, blank=True)
    amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )
    expense_date = models.DateField(null=True, blank=True)

    paid_to = models.CharField(max_length=150, blank=True)
    payment_method = models.CharField(
        max_length=30,
        choices=PAYMENT_METHOD_CHOICES,
        default="Cash",
    )

    reference_number = models.CharField(max_length=100, blank=True)
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="Pending",
    )

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.expense_title


# ==========================================
# STAFF MODEL
# ==========================================

class Staff(models.Model):
    STATUS_CHOICES = [
        ("Active", "Active"),
        ("Inactive", "Inactive"),
        ("On Leave", "On Leave"),
    ]

    staff_name = models.CharField(max_length=150)
    employee_id = models.CharField(
        max_length=50, unique=True
    )
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)

    role = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=100, blank=True)
    joining_date = models.DateField(null=True, blank=True)

    salary = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="Active",
    )

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.staff_name


# ==========================================
# BRANCHES MODEL
# ==========================================

class Branch(models.Model):
    STATUS_CHOICES = [
        ("Active", "Active"),
        ("Inactive", "Inactive"),
    ]

    branch_name = models.CharField(max_length=150)
    branch_code = models.CharField(
        max_length=50, unique=True
    )
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)

    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    manager_name = models.CharField(max_length=150, blank=True)
    opening_date = models.DateField(null=True, blank=True)

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="Active",
    )

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.branch_name


# ==========================================
# NOTIFICATIONS MODEL
# ==========================================

class Notification(models.Model):
    PRIORITY_CHOICES = [
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("Normal", "Normal"),
        ("High", "High"),
        ("Urgent", "Urgent"),
    ]

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("In Progress", "In Progress"),
        ("Sent", "Sent"),
        ("Completed", "Completed"),
    ]

    title = models.CharField(max_length=255)
    message = models.TextField(blank=True)
    notification_type = models.CharField(max_length=100, default="General")
    module = models.CharField(max_length=100, blank=True)
    channel = models.CharField(max_length=50, default="In-App")
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="Pending")
    priority = models.CharField(max_length=30, choices=PRIORITY_CHOICES, default="Medium")
    customer = models.CharField(max_length=150, blank=True)
    due_date = models.DateField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications",
    )
    related_module = models.CharField(max_length=100, blank=True)
    related_record_id = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({'Read' if self.is_read else 'Unread'})"


# ==========================================
# STUDIO SETTINGS MODEL
# ==========================================

class StudioSetting(models.Model):
    name = models.CharField(max_length=200, default="Studio Raw Picturez")
    email = models.EmailField(default="contact@studiorawpicturez.com")
    phone = models.CharField(max_length=30, default="9876543210")
    whatsapp = models.CharField(max_length=30, default="9876543210")
    address = models.TextField(default="Studio Raw Picturez, Main Road")
    city = models.CharField(max_length=100, default="Nagercoil")
    state = models.CharField(max_length=100, default="Tamil Nadu")
    pincode = models.CharField(max_length=20, blank=True, default="629001")
    gst = models.CharField(max_length=50, blank=True)
    currency = models.CharField(max_length=20, default="INR")
    date_format = models.CharField(max_length=50, default="DD-MM-YYYY")
    description = models.TextField(
        default="Professional wedding photography, cinematography, portraits, albums and creative photography services."
    )
    notification_preferences = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
