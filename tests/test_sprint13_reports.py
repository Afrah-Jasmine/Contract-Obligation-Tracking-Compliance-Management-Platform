import asyncio
import time
from datetime import date, timedelta
import pytest
import httpx
from app.main import app


@pytest.mark.asyncio
async def test_sprint13_reports():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        print("\n==================================================")
        print("  SPRINT 13: REPORTS, ANALYTICS & DASHBOARD TEST  ")
        print("==================================================")

        # ----------------------------------------------------------------------
        # Test 10: Unauthorized Request Check (No Auth Token)
        # ----------------------------------------------------------------------
        unauth_dash = await client.get("/dashboard/summary")
        print("\n[Test 10 — Unauthorized Request Check (Dashboard)]")
        print(f"  Status Code: {unauth_dash.status_code}")
        assert unauth_dash.status_code == 401

        unauth_contracts_summary = await client.get("/reports/contracts/summary")
        assert unauth_contracts_summary.status_code == 401

        unauth_pdf = await client.get("/reports/contracts/export/pdf")
        assert unauth_pdf.status_code == 401

        # ----------------------------------------------------------------------
        # Authentication
        # ----------------------------------------------------------------------
        login_resp = await client.post(
            "/auth/login",
            json={"email": "contract.manager@contractiq.com", "password": "password123"}
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.json()}"
        token_data = login_resp.json()
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Fetch current user details from /users/
        users_resp = await client.get("/users/", headers=headers)
        assert users_resp.status_code == 200
        user_list = users_resp.json()
        user_id = user_list[0].get("user_id") or user_list[0].get("id", 1)

        # ----------------------------------------------------------------------
        # Setup Test Data for Analytics & Reports
        # ----------------------------------------------------------------------
        timestamp = int(time.time())

        # 1. Active Contract with Completed Obligation
        cnt_active_num = f"CNT-SPRINT13-ACT-{timestamp}"
        cnt_active_resp = await client.post(
            "/contracts",
            json={
                "title": "Sprint 13 Active Software Agreement",
                "contract_number": cnt_active_num,
                "category": "Software",
                "description": "Active Contract for Analytics Testing",
                "start_date": "2026-01-01",
                "end_date": str(date.today() + timedelta(days=20))
            },
            headers=headers
        )
        assert cnt_active_resp.status_code == 201
        cnt_active_id = cnt_active_resp.json()["id"]

        # Activate contract workflow
        await client.patch(f"/contracts/{cnt_active_id}/status", json={"status": "Under Review"}, headers=headers)
        await client.patch(f"/contracts/{cnt_active_id}/status", json={"status": "Approved"}, headers=headers)
        await client.patch(f"/contracts/{cnt_active_id}/status", json={"status": "Active"}, headers=headers)

        # Add Obligation
        ob_active_resp = await client.post(
            "/obligations",
            json={
                "contract_id": cnt_active_id,
                "title": "Software Deployment Inspection",
                "obligation_type": "Deployment",
                "due_date": str(date.today() + timedelta(days=5)),
                "assigned_to": user_id
            },
            headers=headers
        )
        assert ob_active_resp.status_code == 201

        # 2. High-Risk Contract with Overdue Obligation
        cnt_risk_num = f"CNT-SPRINT13-RISK-{timestamp}"
        cnt_risk_resp = await client.post(
            "/contracts",
            json={
                "title": "Sprint 13 High Risk Vendor Agreement",
                "contract_number": cnt_risk_num,
                "category": "Vendor",
                "description": "High Risk Contract for Analytics Testing",
                "start_date": "2025-01-01",
                "end_date": "2027-12-31"
            },
            headers=headers
        )
        assert cnt_risk_resp.status_code == 201
        cnt_risk_id = cnt_risk_resp.json()["id"]

        # Activate and add overdue obligations
        await client.patch(f"/contracts/{cnt_risk_id}/status", json={"status": "Under Review"}, headers=headers)
        await client.patch(f"/contracts/{cnt_risk_id}/status", json={"status": "Approved"}, headers=headers)
        await client.patch(f"/contracts/{cnt_risk_id}/status", json={"status": "Active"}, headers=headers)

        # Create multiple overdue obligations
        for i in range(1, 3):
            ob_risk_item = await client.post(
                "/obligations",
                json={
                    "contract_id": cnt_risk_id,
                    "title": f"Overdue Audit Obligation #{i}",
                    "obligation_type": "Audit",
                    "due_date": str(date.today() - timedelta(days=15)),
                    "assigned_to": user_id
                },
                headers=headers
            )
            assert ob_risk_item.status_code == 201

        # Trigger compliance evaluations
        await client.get(f"/contracts/{cnt_risk_id}/compliance", headers=headers)
        await client.get(f"/contracts/{cnt_active_id}/compliance", headers=headers)

        # Create Renewal record for contract
        await client.post(
            "/renewals",
            json={
                "contract_id": cnt_active_id,
                "previous_expiry_date": str(date.today() + timedelta(days=20)),
                "renewal_date": str(date.today() + timedelta(days=5)),
                "new_expiry_date": str(date.today() + timedelta(days=385)),
                "notes": "Annual renewal under review"
            },
            headers=headers
        )

        # ----------------------------------------------------------------------
        # Test 1: GET /dashboard/summary
        # ----------------------------------------------------------------------
        dash_resp = await client.get("/dashboard/summary", headers=headers)
        print("\n[Test 1 — Dashboard Summary (GET /dashboard/summary)]")
        print(f"  Status Code: {dash_resp.status_code}")
        dash_data = dash_resp.json()
        print(f"  Contracts Summary: {dash_data['contracts']}")
        print(f"  Obligations Summary: {dash_data['obligations']}")
        print(f"  Renewals Summary: {dash_data['renewals']}")
        print(f"  Compliance Summary: {dash_data['compliance']}")
        assert dash_resp.status_code == 200
        assert dash_data["contracts"]["total"] > 0
        assert dash_data["obligations"]["total"] > 0
        assert "upcoming" in dash_data["renewals"]
        assert "compliant" in dash_data["compliance"]

        # ----------------------------------------------------------------------
        # Test 2: GET /reports/contracts/summary
        # ----------------------------------------------------------------------
        contracts_summary_resp = await client.get("/reports/contracts/summary", headers=headers)
        print("\n[Test 2 — Contract Analytics (GET /reports/contracts/summary)]")
        print(f"  Status Code: {contracts_summary_resp.status_code}")
        c_data = contracts_summary_resp.json()
        print(f"  Total Contracts: {c_data['total_contracts']}")
        print(f"  Active Contracts: {c_data['active_contracts']}")
        print(f"  Categories Distribution: {c_data['contracts_by_category']}")
        assert contracts_summary_resp.status_code == 200
        assert c_data["total_contracts"] >= 2
        assert "Software" in c_data["contracts_by_category"] or len(c_data["contracts_by_category"]) > 0

        # ----------------------------------------------------------------------
        # Test 3: GET /reports/obligations/summary
        # ----------------------------------------------------------------------
        ob_summary_resp = await client.get("/reports/obligations/summary", headers=headers)
        print("\n[Test 3 — Obligation Analytics (GET /reports/obligations/summary)]")
        print(f"  Status Code: {ob_summary_resp.status_code}")
        o_data = ob_summary_resp.json()
        print(f"  Total Obligations: {o_data['total_obligations']}")
        print(f"  Overdue Obligations: {o_data['overdue_obligations']}")
        assert ob_summary_resp.status_code == 200
        assert o_data["total_obligations"] >= 3
        assert o_data["overdue_obligations"] >= 2

        # ----------------------------------------------------------------------
        # Test 4: GET /reports/renewals/summary
        # ----------------------------------------------------------------------
        renewals_summary_resp = await client.get("/reports/renewals/summary", headers=headers)
        print("\n[Test 4 — Renewal Analytics (GET /reports/renewals/summary)]")
        print(f"  Status Code: {renewals_summary_resp.status_code}")
        r_data = renewals_summary_resp.json()
        print(f"  Upcoming Renewals: {r_data['upcoming_renewals']}")
        print(f"  Approaching Expiry Count: {len(r_data['contracts_approaching_expiry'])}")
        assert renewals_summary_resp.status_code == 200
        assert r_data["upcoming_renewals"] >= 1
        assert len(r_data["contracts_approaching_expiry"]) >= 1

        # ----------------------------------------------------------------------
        # Test 5: GET /reports/compliance/summary
        # ----------------------------------------------------------------------
        compliance_summary_resp = await client.get("/reports/compliance/summary", headers=headers)
        print("\n[Test 5 — Compliance Analytics (GET /reports/compliance/summary)]")
        print(f"  Status Code: {compliance_summary_resp.status_code}")
        comp_data = compliance_summary_resp.json()
        print(f"  Evaluated Contracts: {comp_data['total_contracts_evaluated']}")
        print(f"  High Risk Contracts: {comp_data['high_risk_contracts']}")
        print(f"  Average Score: {comp_data['average_compliance_score']}%")
        assert compliance_summary_resp.status_code == 200
        assert comp_data["total_contracts_evaluated"] >= 2

        # ----------------------------------------------------------------------
        # Test 6: GET /reports/risk
        # ----------------------------------------------------------------------
        risk_resp = await client.get("/reports/risk", headers=headers)
        print("\n[Test 6 — Risk Analysis (GET /reports/risk)]")
        print(f"  Status Code: {risk_resp.status_code}")
        risk_data = risk_resp.json()
        print(f"  High Risk Items Count: {len(risk_data)}")
        if len(risk_data) > 0:
            print(f"  Sample High Risk Item: {risk_data[0]}")
        assert risk_resp.status_code == 200
        assert len(risk_data) >= 1
        assert any(r["contract_id"] == cnt_risk_id for r in risk_data)

        # ----------------------------------------------------------------------
        # Test 7: Export Contract Report as PDF
        # ----------------------------------------------------------------------
        contracts_pdf_resp = await client.get("/reports/contracts/export/pdf", headers=headers)
        print("\n[Test 7 — Export Contract Report as PDF (GET /reports/contracts/export/pdf)]")
        print(f"  Status Code: {contracts_pdf_resp.status_code}")
        print(f"  Content-Type: {contracts_pdf_resp.headers.get('content-type')}")
        print(f"  PDF Content Length: {len(contracts_pdf_resp.content)} bytes")
        assert contracts_pdf_resp.status_code == 200
        assert "application/pdf" in contracts_pdf_resp.headers.get("content-type", "")
        assert contracts_pdf_resp.content.startswith(b"%PDF")

        # ----------------------------------------------------------------------
        # Test 8: Export Contract Report as Excel
        # ----------------------------------------------------------------------
        contracts_excel_resp = await client.get("/reports/contracts/export/excel", headers=headers)
        print("\n[Test 8 — Export Contract Report as Excel (GET /reports/contracts/export/excel)]")
        print(f"  Status Code: {contracts_excel_resp.status_code}")
        print(f"  Content-Type: {contracts_excel_resp.headers.get('content-type')}")
        print(f"  Excel Content Length: {len(contracts_excel_resp.content)} bytes")
        assert contracts_excel_resp.status_code == 200
        assert "spreadsheetml" in contracts_excel_resp.headers.get("content-type", "")
        assert contracts_excel_resp.content.startswith(b"PK")

        # ----------------------------------------------------------------------
        # Test 9: Additional PDF & Excel Exports (Obligations, Renewals, Compliance)
        # ----------------------------------------------------------------------
        ob_pdf = await client.get("/reports/obligations/export/pdf", headers=headers)
        assert ob_pdf.status_code == 200 and ob_pdf.content.startswith(b"%PDF")

        ob_excel = await client.get("/reports/obligations/export/excel", headers=headers)
        assert ob_excel.status_code == 200 and ob_excel.content.startswith(b"PK")

        ren_pdf = await client.get("/reports/renewals/export/pdf", headers=headers)
        assert ren_pdf.status_code == 200 and ren_pdf.content.startswith(b"%PDF")

        ren_excel = await client.get("/reports/renewals/export/excel", headers=headers)
        assert ren_excel.status_code == 200 and ren_excel.content.startswith(b"PK")

        comp_pdf = await client.get("/reports/compliance/export/pdf", headers=headers)
        assert comp_pdf.status_code == 200 and comp_pdf.content.startswith(b"%PDF")

        comp_excel = await client.get("/reports/compliance/export/excel", headers=headers)
        assert comp_excel.status_code == 200 and comp_excel.content.startswith(b"PK")

        print("\n[Test 9 — Additional PDF & Excel Exports]")
        print("  Obligations, Renewals, and Compliance PDF & Excel downloads verified successfully!")

        # ----------------------------------------------------------------------
        # Test 10: Department Performance Summary
        # ----------------------------------------------------------------------
        dept_resp = await client.get("/reports/departments/summary", headers=headers)
        print("\n[Test 10 — Department Performance Analysis (GET /reports/departments/summary)]")
        print(f"  Status Code: {dept_resp.status_code}")
        dept_data = dept_resp.json()
        print(f"  Departments Count: {len(dept_data['departments'])}")
        print(f"  Department List: {dept_data['departments']}")
        assert dept_resp.status_code == 200
        assert "departments" in dept_data

        print("\n==================================================")
        print("  ALL SPRINT 13 REPORT & ANALYTICS TESTS PASSED! ")
        print("==================================================\n")


if __name__ == "__main__":
    asyncio.run(test_sprint13_reports())
