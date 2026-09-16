import asyncio
import os
import json
import pytest
import httpx
from app.main import app

@pytest.mark.asyncio
async def test_sprint14_frontend_integration():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        print("\n==================================================")
        print("  SPRINT 14: FRONTEND FOUNDATION & DASHBOARD TEST ")
        print("==================================================")

        # ----------------------------------------------------------------------
        # Test 1: Angular Build Bundle Verification
        # ----------------------------------------------------------------------
        dist_path = os.path.join(os.getcwd(), "frontend", "dist", "contract-iq-frontend", "browser")
        if not os.path.exists(dist_path):
            dist_path = os.path.join(os.getcwd(), "frontend", "dist", "contract-iq-frontend")

        print(f"\n[Test 1 — Angular Bundle Directory Check]")
        print(f"  Target Path: {dist_path}")
        assert os.path.exists(dist_path), f"Angular build directory does not exist at {dist_path}"
        
        index_html = os.path.join(dist_path, "index.html")
        assert os.path.exists(index_html), "index.html missing from Angular output bundle"
        with open(index_html, "r", encoding="utf-8") as f:
            html_content = f.read()
        print(f"  index.html Size: {len(html_content)} bytes")
        assert "<app-root></app-root>" in html_content

        # ----------------------------------------------------------------------
        # Test 2: Unauthenticated Route Protection (GET /dashboard/summary)
        # ----------------------------------------------------------------------
        unauth_resp = await client.get("/dashboard/summary")
        print("\n[Test 2 — Route Protection Check (Unauthenticated Access)]")
        print(f"  Status Code: {unauth_resp.status_code} (Expected 401 Unauthorized)")
        assert unauth_resp.status_code == 401

        # ----------------------------------------------------------------------
        # Test 3: Authentication API Integration (Login Flow)
        # ----------------------------------------------------------------------
        print("\n[Test 3 — Authentication API Integration (POST /auth/login)]")
        login_payload = {
            "email": "contract.manager@contractiq.com",
            "password": "password123"
        }
        login_resp = await client.post("/auth/login", json=login_payload)
        print(f"  Login Status Code: {login_resp.status_code}")
        assert login_resp.status_code == 200, f"Login failed: {login_resp.json()}"
        
        token_data = login_resp.json()
        assert "access_token" in token_data
        access_token = token_data["access_token"]
        print(f"  JWT Token Received: {access_token[:25]}...")
        headers = {"Authorization": f"Bearer {access_token}"}

        # ----------------------------------------------------------------------
        # Test 4: Dashboard API Integration (Data Matching Backend)
        # ----------------------------------------------------------------------
        print("\n[Test 4 — Dashboard API Integration (GET /dashboard/summary)]")
        dashboard_resp = await client.get("/dashboard/summary", headers=headers)
        print(f"  Status Code: {dashboard_resp.status_code}")
        assert dashboard_resp.status_code == 200
        
        dash_data = dashboard_resp.json()
        print(f"  Contracts Total: {dash_data['contracts']['total']}")
        print(f"  Contracts Active: {dash_data['contracts']['active']}")
        print(f"  Obligations Total: {dash_data['obligations']['total']}")
        print(f"  Obligations Overdue: {dash_data['obligations']['overdue']}")
        print(f"  Renewals Upcoming: {dash_data['renewals']['upcoming']}")
        print(f"  Compliance High Risk: {dash_data['compliance']['high_risk']}")
        
        assert dash_data["contracts"]["total"] >= 0
        assert dash_data["obligations"]["total"] >= 0
        assert dash_data["renewals"]["upcoming"] >= 0

        # ----------------------------------------------------------------------
        # Test 5: Analytics Summary Endpoints for Charts
        # ----------------------------------------------------------------------
        print("\n[Test 5 — Analytics APIs for Chart Visualizations]")
        
        c_summary = await client.get("/reports/contracts/summary", headers=headers)
        assert c_summary.status_code == 200
        print(f"  Contracts Summary Categories: {c_summary.json()['contracts_by_category']}")

        o_summary = await client.get("/reports/obligations/summary", headers=headers)
        assert o_summary.status_code == 200
        print(f"  Obligation Summary Statuses: Completed={o_summary.json()['completed_obligations']}, Overdue={o_summary.json()['overdue_obligations']}")

        r_summary = await client.get("/reports/renewals/summary", headers=headers)
        assert r_summary.status_code == 200
        print(f"  Upcoming Expiry Contracts Count: {len(r_summary.json()['contracts_approaching_expiry'])}")

        comp_summary = await client.get("/reports/compliance/summary", headers=headers)
        assert comp_summary.status_code == 200
        print(f"  Compliance Average Score: {comp_summary.json()['average_compliance_score']}%")

        risk_summary = await client.get("/reports/risk", headers=headers)
        assert risk_summary.status_code == 200
        print(f"  High Risk Table Item Count: {len(risk_summary.json())}")

        # ----------------------------------------------------------------------
        # Test 6: Role-Based Navigation User Info Check
        # ----------------------------------------------------------------------
        print("\n[Test 6 — Role & User Identity Profile Check]")
        users_resp = await client.get("/users/", headers=headers)
        assert users_resp.status_code == 200
        print(f"  Authorized Users Count: {len(users_resp.json())}")

        print("\n==================================================")
        print("  ALL SPRINT 14 FRONTEND INTEGRATION TESTS PASSED!")
        print("==================================================\n")

if __name__ == "__main__":
    asyncio.run(test_sprint14_frontend_integration())
