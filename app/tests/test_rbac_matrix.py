import pytest
from fastapi import HTTPException

from app.api.contract import (
    CONTRACT_CREATE_ROLES,
    CONTRACT_DETAIL_ROLES,
    CONTRACT_VIEW_ROLES,
    CONTRACT_WRITE_ROLES,
)
from app.api.obligation import MANAGE_ROLES, PROGRESS_ROLES, VIEW_ROLES
from app.api.renewal import ALL_ROLES, MANAGER_ROLES, STATUS_ROLES
from app.middleware.auth import require_roles


ROLES = (
    "Administrator",
    "Legal Manager",
    "Compliance Officer",
    "Contract Manager",
    "Department Head",
    "Employee",
)


def allowed(roles: tuple[str, ...], role: str) -> bool:
    try:
        require_roles(*roles)({"role": role})
    except HTTPException as error:
        assert error.status_code == 403
        return False
    return True


@pytest.mark.parametrize(
    ("operation", "roles", "expected"),
    [
        ("contract_create", CONTRACT_CREATE_ROLES, {"Administrator", "Legal Manager", "Contract Manager"}),
        ("contract_view_all", CONTRACT_VIEW_ROLES, set(ROLES)),
        ("contract_view_by_id", CONTRACT_DETAIL_ROLES, {"Administrator", "Compliance Officer", "Contract Manager", "Department Head", "Employee"}),
        ("contract_update", CONTRACT_WRITE_ROLES, {"Administrator", "Contract Manager"}),
        ("contract_delete", CONTRACT_WRITE_ROLES, {"Administrator", "Contract Manager"}),
        ("obligation_manage", MANAGE_ROLES, {"Administrator", "Legal Manager", "Contract Manager"}),
        ("obligation_view", VIEW_ROLES, set(ROLES)),
        ("obligation_status", PROGRESS_ROLES, set(ROLES)),
        ("renewal_view", ALL_ROLES, set(ROLES)),
        ("renewal_write", MANAGER_ROLES, {"Administrator", "Legal Manager", "Contract Manager"}),
        ("renewal_status", STATUS_ROLES, {"Administrator", "Legal Manager", "Contract Manager"}),
    ],
)
def test_role_permission_matrix(operation: str, roles: tuple[str, ...], expected: set[str]):
    assert {role for role in ROLES if allowed(roles, role)} == expected


def test_unauthorized_role_is_rejected_by_backend_dependency():
    with pytest.raises(HTTPException) as error:
        require_roles("Administrator")({"role": "Employee"})

    assert error.value.status_code == 403
    assert error.value.detail == "You do not have permission to perform this action."