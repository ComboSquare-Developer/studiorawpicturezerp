
from rest_framework.permissions import BasePermission, SAFE_METHODS


def is_admin(user):
    """ERP administrator: active Django superuser."""
    return bool(
        user
        and user.is_authenticated
        and user.is_active
        and user.is_superuser
    )


def is_erp_staff(user):
    """ERP staff: active user assigned to the ERP Staff group."""
    return bool(
        user
        and user.is_authenticated
        and user.is_active
        and user.groups.filter(name="ERP Staff").exists()
    )


class IsERPAdmin(BasePermission):
    message = "Only ERP administrators can access this resource."

    def has_permission(self, request, view):
        return is_admin(request.user)


class IsERPAdminOrStaffReadOnly(BasePermission):
    message = "You do not have permission to modify this resource."

    def has_permission(self, request, view):
        user = request.user

        if is_admin(user):
            return True

        return is_erp_staff(user) and request.method in SAFE_METHODS


class IsERPAdminOrStaffEditor(BasePermission):
    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        user = request.user

        if is_admin(user):
            return True

        if not is_erp_staff(user):
            return False

        # Staff can view, create and edit, but cannot delete.
        return request.method in (
            "GET", "HEAD", "OPTIONS",
            "POST", "PUT", "PATCH"
        )
class IsERPNotificationUser(BasePermission):
    message = "You do not have permission to perform this notification action."

    def has_permission(self, request, view):
        user = request.user

        if is_admin(user):
            return True

        if not is_erp_staff(user):
            return False

        if request.method in SAFE_METHODS:
            return True

        return (
            request.method == "POST"
            and getattr(view, "action", None)
            in ("mark_read", "mark_all_read")
        )