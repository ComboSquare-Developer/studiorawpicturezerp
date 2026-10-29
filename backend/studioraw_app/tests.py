from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

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


class StudioRawERPTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="admin",
            email="admin@studiorawpicturez.com",
            password="testpassword123",
            first_name="Admin",
            last_name="User",
        )
        self.client.force_authenticate(user=self.user)

    def test_auth_me(self):
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "admin")

    def test_customer_crud(self):
        create_res = self.client.post("/api/customers/", {
            "name": "Karthik Raja",
            "phone": "9876543210",
            "email": "karthik@example.com",
            "address": "123 Main St, Nagercoil",
            "event_type": "Wedding",
        })
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        customer_id = create_res.data["id"]

        list_res = self.client.get("/api/customers/")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertTrue(len(list_res.data) >= 1)

        patch_res = self.client.patch(f"/api/customers/{customer_id}/", {
            "address": "456 Beach Road, Chennai",
        })
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data["address"], "456 Beach Road, Chennai")

        del_res = self.client.delete(f"/api/customers/{customer_id}/")
        self.assertEqual(del_res.status_code, status.HTTP_204_NO_CONTENT)

    def test_enquiry_crud(self):
        res = self.client.post("/api/enquiries/", {
            "name": "Anitha",
            "phone": "9876543211",
            "event_type": "Wedding Photography",
            "budget": "50000.00",
            "status": "New",
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Enquiry.objects.count(), 1)

    def test_booking_and_payment_flow(self):
        customer = Customer.objects.create(
            name="Rahul Sharma",
            phone="9876543212",
        )
        booking_res = self.client.post("/api/bookings/", {
            "customer": customer.id,
            "customer_name": "Rahul Sharma",
            "phone": "9876543212",
            "event_type": "Wedding",
            "total_amount": "80000.00",
            "advance_amount": "20000.00",
            "status": "Confirmed",
        })
        self.assertEqual(booking_res.status_code, status.HTTP_201_CREATED)
        booking_id = booking_res.data["id"]

        pay_res = self.client.post("/api/payments/", {
            "customer": customer.id,
            "booking": booking_id,
            "customer_name": "Rahul Sharma",
            "total_amount": "80000.00",
            "paid_amount": "20000.00",
            "balance_amount": "60000.00",
            "payment_method": "UPI",
            "status": "Partial",
        })
        self.assertEqual(pay_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Payment.objects.count(), 1)

    def test_delivery_crud(self):
        deliv = self.client.post("/api/deliveries/", {
            "customer_name": "Divya",
            "phone": "9876543213",
            "item_name": "Wedding Album",
            "status": "Pending",
            "payment_status": "Paid",
        })
        self.assertEqual(deliv.status_code, status.HTTP_201_CREATED)

    def test_wedding_services(self):
        p_res = self.client.post("/api/wedding-photography/", {
            "customer_name": "Sanjay & Meena",
            "phone": "9876543214",
            "service_type": "Traditional",
            "package_amount": "120000.00",
            "advance_amount": "40000.00",
            "status": "Confirmed",
        })
        self.assertEqual(p_res.status_code, status.HTTP_201_CREATED)

        v_res = self.client.post("/api/wedding-videography/", {
            "customer_name": "Sanjay & Meena",
            "phone": "9876543214",
            "service_type": "Traditional",
            "package_amount": "150000.00",
            "advance_amount": "50000.00",
            "status": "Confirmed",
        })
        self.assertEqual(v_res.status_code, status.HTTP_201_CREATED)

    def test_functions_and_event_management(self):
        f_res = self.client.post("/api/functions-we-arrange/", {
            "customer_name": "Praveen",
            "phone": "9876543215",
            "function_type": "Birthday Celebrations",
            "total_amount": "35000.00",
            "advance_amount": "10000.00",
            "status": "Upcoming",
        })
        self.assertEqual(f_res.status_code, status.HTTP_201_CREATED)

        e_res = self.client.post("/api/event-management/", {
            "customer_name": "Keerthana",
            "phone": "9876543216",
            "event_name": "Corporate Gala",
            "event_type": "Corporate Events",
            "total_amount": "95000.00",
            "advance_amount": "30000.00",
            "status": "Confirmed",
        })
        self.assertEqual(e_res.status_code, status.HTTP_201_CREATED)

    def test_customized_gifts(self):
        g_res = self.client.post("/api/customized-gifts/", {
            "customer_name": "Harini",
            "phone": "9876543217",
            "gift_name": "3D Crystal Frame",
            "gift_type": "Photo Frame / Photo Click",
            "quantity": 2,
            "total_amount": "3000.00",
            "advance_amount": "1500.00",
            "status": "Processing",
        })
        self.assertEqual(g_res.status_code, status.HTTP_201_CREATED)

    def test_inventory_equipment_expense(self):
        # Inventory
        inv_res = self.client.post("/api/inventory/", {
            "item_name": "Premium Photo Paper 4x6",
            "category": "Raw Material",
            "quantity": 500,
            "unit": "Sheets",
            "unit_price": "2.50",
            "minimum_stock": 50,
            "status": "Available",
        })
        self.assertEqual(inv_res.status_code, status.HTTP_201_CREATED)

        # Equipment
        eq_res = self.client.post("/api/equipment/", {
            "equipment_name": "Sony A7 IV Camera",
            "category": "Camera",
            "serial_number": "SONY-A7IV-001",
            "status": "Available",
            "condition": "Excellent",
        })
        self.assertEqual(eq_res.status_code, status.HTTP_201_CREATED)

        # Expense
        exp_res = self.client.post("/api/expenses/", {
            "expense_title": "Studio Lighting Bulb Replacement",
            "category": "Maintenance",
            "amount": "1200.00",
            "payment_method": "Cash",
            "status": "Paid",
        })
        self.assertEqual(exp_res.status_code, status.HTTP_201_CREATED)

    def test_staff_and_branch(self):
        st_res = self.client.post("/api/staff/", {
            "staff_name": "Manoj Photographer",
            "employee_id": "EMP-001",
            "phone": "9876543218",
            "role": "Photographer",
            "salary": "25000.00",
            "status": "Active",
        })
        self.assertEqual(st_res.status_code, status.HTTP_201_CREATED)

        br_res = self.client.post("/api/branches/", {
            "branch_name": "Studio Raw - Nagercoil Branch",
            "branch_code": "BR-001",
            "city": "Nagercoil",
            "phone": "9876543219",
            "status": "Active",
        })
        self.assertEqual(br_res.status_code, status.HTTP_201_CREATED)

    def test_notifications_api(self):
        notif = Notification.objects.create(
            recipient=self.user,
            title="Test Notice",
            message="Test message",
            notification_type="booking",
            is_read=False,
        )
        count_res = self.client.get("/api/notifications/unread-count/")
        self.assertEqual(count_res.status_code, status.HTTP_200_OK)
        self.assertEqual(count_res.data["unread_count"], 1)

        read_res = self.client.post(f"/api/notifications/{notif.id}/mark-read/")
        self.assertEqual(read_res.status_code, status.HTTP_200_OK)

        count_res2 = self.client.get("/api/notifications/unread-count/")
        self.assertEqual(count_res2.data["unread_count"], 0)

    def test_dashboard_stats_and_reports(self):
        dash_res = self.client.get("/api/dashboard/stats/")
        self.assertEqual(dash_res.status_code, status.HTTP_200_OK)
        self.assertIn("total_customers", dash_res.data)
        self.assertIn("total_bookings", dash_res.data)
        self.assertIn("total_payments_received", dash_res.data)

        rep_res = self.client.get("/api/reports/summary/")
        self.assertEqual(rep_res.status_code, status.HTTP_200_OK)
        self.assertIn("customers", rep_res.data)
        self.assertIn("payments", rep_res.data)
        self.assertIn("expenses", rep_res.data)

        csv_res = self.client.get("/api/reports/export-csv/?type=summary")
        self.assertEqual(csv_res.status_code, status.HTTP_200_OK)
        self.assertEqual(csv_res["Content-Type"], "text/csv")

    def test_studio_settings(self):
        get_res = self.client.get("/api/settings/")
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)

        patch_res = self.client.patch("/api/settings/", {
            "name": "Studio Raw Picturez Premium",
            "phone": "04652-123456",
        })
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data["data"]["name"], "Studio Raw Picturez Premium")
