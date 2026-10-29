
from django.contrib import admin
from .models import Customer, Enquiry


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "phone", "email", "created_at")
    search_fields = ("name", "phone", "email")
    list_filter = ("created_at",)


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "phone",
        "event_type",
        "status",
        "event_date",
    )
    search_fields = ("name", "phone", "email")
    list_filter = ("status", "event_type", "created_at")

