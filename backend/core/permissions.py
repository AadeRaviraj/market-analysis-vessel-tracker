from rest_framework import permissions


class IsOfficeAdminOrReadOnly(permissions.BasePermission):
    """
    Office Admins (User.is_staff = True) => full read/write access.
    Office Users (regular authenticated users) => read-only (GET/HEAD/OPTIONS).

    Matches the requirement:
      "Normal users are not authorized to input data into the system;
       administrators retain full access to all other functions."
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user.is_staff)
