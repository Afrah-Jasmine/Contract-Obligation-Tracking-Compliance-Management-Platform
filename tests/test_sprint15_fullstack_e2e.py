import asyncio
import os
import time
from datetime import date, timedelta
import pytest
import httpx
from app.main import app

@pytest.mark.asyncio
async def test_sprint15_fullstack_e2e():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        print("\n==========================================================================")
        print("  SPRINT 15: FULL-STACK ANGULAR FRONTEND & FASTAPI BACKEND E2E TEST SUITE ")
        print("==========================================================================")

        # ----------------------------------------------------------------------
        # Step 1: Angular Build Bundle Verification
        # ----------------------------------------------------------------------
        print("\n[Step 1 - Frontend Bundle Verification]")
        dist_path = os.path.join(os.getcwd(), "frontend", "dist", "contract-iq-frontend", "browser")
        if not os.path.exists(dist_path):
            dist_path = os.path.join(os.getcwd(), "frontend", "dist", "contract-iq-frontend")

        print(f"  Target Dist Path: {dist_path}")
        assert os.path.exists(dist_path), f"Frontend build output missing at {dist_path}"
        index_html = os.path.join(dist_path, "index.html")
        assert os.path.exists(index_html), "index.html missing from output bundle"
        with open(index_html, "r", encoding="utf-8") as f:
            html_content = f.read()
        assert "<app-root></app-root>" in html_content
        print("  [OK] Angular build output bundle present and valid")

        # ----------------------------------------------------------------------
        # Step 2: Auth Flow & User Identity Verification
        # ----------------------------------------------------------------------
        print("\n[Step 2 - Authentication & Profile Workflow]")
        login_resp = await client.post(
            "/auth/login",
            json={"email": "contract.manager@contractiq.com", "password": "password123"}
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.json()}"
        auth_data = login_resp.json()
        assert "access_token" in auth_data
        token = auth_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("  [OK] Login successful (200 OK), JWT token retrieved")

        # Get current user details and valid DB user list
        me_resp = await client.get("/users/me", headers=headers)
        assert me_resp.status_code == 200
        me_data = me_resp.json()

        users_list_resp = await client.get("/users/", headers=headers)
        assert users_list_resp.status_code == 200
        users_list = users_list_resp.json()
        user_id = users_list[0].get("user_id") or users_list[0].get("id", 1)
        print(f"  [OK] User profile retrieved: ID {user_id}, Email: {me_data.get('email')}, Role: {me_data.get('role')}")

        # ----------------------------------------------------------------------
        # Step 3: Contract Lifecycle Workflow
        # ----------------------------------------------------------------------
        print("\n[Step 3 - Contract Lifecycle Workflow]")
        timestamp = int(time.time())
        contract_num = f"CNT-S15-E2E-{timestamp}"
        
        # 3a. Create Contract
        create_c_resp = await client.post(
            "/contracts",
            json={
                "title": f"Sprint 15 E2E Enterprise License Agreement {timestamp}",
                "contract_number": contract_num,
                "category": "Software",
                "description": "Full-stack E2E integration test contract",
                "start_date": str(date.today()),
                "end_date": str(date.today() + timedelta(days=60))
            },
            headers=headers
        )
        assert create_c_resp.status_code == 201
        contract = create_c_resp.json()
        contract_id = contract["id"]
        print(f"  [OK] Contract created: ID {contract_id}, Number: {contract_num}, Initial Status: {contract.get('status')}")

        # 3b. Advance Contract Status: Draft -> Under Review -> Approved -> Active
        for next_status in ["Under Review", "Approved", "Active"]:
            status_resp = await client.patch(
                f"/contracts/{contract_id}/status",
                json={"status": next_status},
                headers=headers
            )
            assert status_resp.status_code == 200
            print(f"  [OK] Contract status transitioned to: '{next_status}'")

        # ----------------------------------------------------------------------
        # Step 4: Obligation Management Workflow
        # ----------------------------------------------------------------------
        print("\n[Step 4 - Obligation Management Workflow]")
        create_ob_resp = await client.post(
            "/obligations",
            json={
                "contract_id": contract_id,
                "title": f"Security Audit Compliance Check {timestamp}",
                "obligation_type": "Audit",
                "due_date": str(date.today() + timedelta(days=10)),
                "assigned_to": user_id
            },
            headers=headers
        )
        assert create_ob_resp.status_code == 201
        obligation = create_ob_resp.json()
        obligation_id = obligation["id"]
        print(f"  [OK] Obligation created: ID {obligation_id}, Title: {obligation['title']}")

        # Complete Obligation
        ob_status_resp = await client.patch(
            f"/obligations/{obligation_id}/status",
            json={"status": "Completed"},
            headers=headers
        )
        assert ob_status_resp.status_code == 200
        print("  [OK] Obligation status updated to 'Completed'")

        # ----------------------------------------------------------------------
        # Step 5: Renewal Management Workflow
        # ----------------------------------------------------------------------
        print("\n[Step 5 - Renewal Tracking Workflow]")
        create_ren_resp = await client.post(
            "/renewals",
            json={
                "contract_id": contract_id,
                "renewal_date": str(date.today() + timedelta(days=30)),
                "previous_expiry_date": str(date.today() + timedelta(days=60)),
                "new_expiry_date": str(date.today() + timedelta(days=425)),
                "assigned_to": user_id,
                "notes": "Standard 12-month auto-renewal with 3% escalation cap"
            },
            headers=headers
        )
        assert create_ren_resp.status_code == 201
        renewal = create_ren_resp.json()
        renewal_id = renewal["id"]
        print(f"  [OK] Renewal created: ID {renewal_id}, Target Expiry: {renewal.get('new_expiry_date')}")

        # Update renewal status
        ren_status_resp = await client.patch(
            f"/renewals/{renewal_id}/status",
            json={"status": "In Progress"},
            headers=headers
        )
        assert ren_status_resp.status_code in [200, 201]
        print("  [OK] Renewal status updated to 'In Progress'")

        # ----------------------------------------------------------------------
        # Step 6: Compliance Evaluation Workflow
        # ----------------------------------------------------------------------
        print("\n[Step 6 - Compliance & Risk Evaluation Workflow]")
        eval_resp = await client.get(
            f"/contracts/{contract_id}/compliance",
            headers=headers
        )
        assert eval_resp.status_code == 200
        comp_data = eval_resp.json()
        print(f"  [OK] Compliance score calculated: Score {comp_data.get('compliance_score')}%, Risk Level: {comp_data.get('risk_level')}")

        # ----------------------------------------------------------------------
        # Step 7: Notifications & Alerts Workflow
        # ----------------------------------------------------------------------
        print("\n[Step 7 - Notifications & Alerts Center Workflow]")
        notif_resp = await client.get("/notifications", headers=headers)
        assert notif_resp.status_code == 200
        notifs = notif_resp.json()
        print(f"  [OK] Retrieved {len(notifs)} notification alert(s) for current user")
        if len(notifs) > 0:
            first_notif_id = notifs[0]["id"]
            mark_read_resp = await client.patch(f"/notifications/{first_notif_id}/read", headers=headers)
            assert mark_read_resp.status_code in [200, 204]
            print(f"  [OK] Marked notification {first_notif_id} as read")

        # ----------------------------------------------------------------------
        # Step 8: Dashboard Summary & Analytics Aggregation Workflow
        # ----------------------------------------------------------------------
        print("\n[Step 8 - Dashboard & Analytics Aggregation Workflow]")
        dash_resp = await client.get("/dashboard/summary", headers=headers)
        assert dash_resp.status_code == 200
        dash_summary = dash_resp.json()
        print(f"  [OK] Dashboard KPI Summary: Total Contracts={dash_summary['contracts']['total']}, Active={dash_summary['contracts']['active']}")
        print(f"  [OK] Obligation Aggregation: Total={dash_summary['obligations']['total']}, Overdue={dash_summary['obligations']['overdue']}")
        print(f"  [OK] Renewal Aggregation: Upcoming={dash_summary['renewals']['upcoming']}")
        print(f"  [OK] Compliance Aggregation: High Risk={dash_summary['compliance']['high_risk']}")

        # ----------------------------------------------------------------------
        # Step 9: PDF & Excel Export Reports Workflow
        # ----------------------------------------------------------------------
        print("\n[Step 9 - Report Exports Workflow]")
        pdf_resp = await client.get("/reports/contracts/export/pdf", headers=headers)
        assert pdf_resp.status_code == 200
        assert pdf_resp.headers.get("content-type") == "application/pdf"
        assert pdf_resp.content.startswith(b"%PDF")
        print(f"  [OK] PDF Export generated successfully ({len(pdf_resp.content)} bytes)")

        excel_resp = await client.get("/reports/contracts/export/excel", headers=headers)
        assert excel_resp.status_code == 200
        assert "spreadsheetml" in excel_resp.headers.get("content-type", "") or len(excel_resp.content) > 0
        print(f"  [OK] Excel Export generated successfully ({len(excel_resp.content)} bytes)")

        # ----------------------------------------------------------------------
        # Step 10: Audit Log & Compliance Trail Verification Workflow
        # ----------------------------------------------------------------------
        print("\n[Step 10 - Compliance & Report Audit Trail Workflow]")
        audit_resp = await client.get("/reports/compliance", headers=headers)
        assert audit_resp.status_code == 200
        logs = audit_resp.json()
        print(f"  [OK] Retrieved {len(logs)} compliance audit record entries")

        print("\n==========================================================================")
        print("  [OK] ALL SPRINT 15 FULL-STACK END-TO-END INTEGRATION TESTS PASSED 100% ")
        print("==========================================================================")
