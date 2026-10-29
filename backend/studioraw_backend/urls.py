
from django.contrib import admin
from django.urls import path, include

from studioraw_app.views import (
    csrf_token_view,
    login_view,
    logout_view,
    current_user_view,
    update_profile_view,
    change_password_view,
    forgot_password_view,
    reset_password_view,
)

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/csrf/", csrf_token_view),
    path("api/login/", login_view),
    path("api/logout/", logout_view),
    path("api/auth/me/", current_user_view),
    path("api/auth/profile/", update_profile_view),
    path("api/auth/change-password/", change_password_view),
    path("api/auth/forgot-password/", forgot_password_view),
    path("api/auth/reset-password/", reset_password_view),

    path("api/", include("studioraw_app.urls")),
    path("api-auth/", include("rest_framework.urls")),
]
