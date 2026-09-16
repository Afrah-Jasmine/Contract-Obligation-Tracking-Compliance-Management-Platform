import pytest
from fastapi import HTTPException

from app.api.contract import (
    CONTRACT_CREATE_ROLES,
    CONTRACT_DETAIL_ROLES,
    CONTRACT_VIEW_ROLES,
    CONTRACT_WRITE_ROLES,
    router,
)
from app.middleware.auth import require_roles

ROLES = (
    "Administrator",
    "Legal Manager",
    "Compliance Officer",
    "Contract Manager",
    "Department Head",
    "Employee",
)

EXPECTED = {
    "create": set(CONTRACT_CREATE_ROLES),
    "view_all": set(CONTRACT_VIEW_ROLES),
    "view_by_id": set(CONTRACT_DETAIL_ROLES),
    "update": set(CONTRACT_WRITE_ROLES),
    "delete": set(CONTRACT_WRITE_ROLES),
}


def check_permission(allowed_roles: set[str], role: str) -> bool:
    checker = require_roles(*allowed_roles)
    try:
        checker({"role": role})
    except HTTPException as error:
        assert error.status_code == 403
        assert error.detail == "You do not have permission to perform this action."
        return False
    return True


@pytest.mark.parametrize("operation", EXPECTED)
@pytest.mark.parametrize("role", ROLES)
def test_contract_crud_permission_matrix(operation: str, role: str):
    assert check_permission(EXPECTED[operation], role) is (
        role in EXPECTED[operation]
    )


def test_contract_routes_use_expected_role_sets():
    route_roles = {}
    for route in router.routes:
        role_dependency = next(
            dependency
            for dependency in route.dependant.dependencies
            if getattr(dependency.call, "__name__", "") == "role_checker"
        )
        route_roles[(next(iter(route.methods)), route.path)] = set(
            role_dependency.call.__closure__[0].cell_contents
        )

    assert route_roles[("POST", "/contracts")] == EXPECTED["create"]
    assert route_roles[("GET", "/contracts")] == EXPECTED["view_all"]
    assert route_roles[("GET", "/contracts/{contract_id}")] == EXPECTED["view_by_id"]
    assert route_roles[("PUT", "/contracts/{contract_id}")] == EXPECTED["update"]
    assert route_roles[("DELETE", "/contracts/{contract_id}")] == EXPECTED["delete"]

    for path in (
        "/contracts/{contract_id}/status",
        "/contracts/{contract_id}/submit-review",
        "/contracts/{contract_id}/approve",
        "/contracts/{contract_id}/activate",
        "/contracts/{contract_id}/assign",
    ):
        method = next(iter(next(route for route in router.routes if route.path == path).methods))
        assert route_roles[(method, path)] == EXPECTED["update"]
