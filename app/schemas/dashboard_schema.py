from datetime import date

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    contracts: dict[str, int]
    obligations: dict[str, int]
    renewals: dict[str, int]


class StatusCount(BaseModel):
    status: str
    count: int


class UpcomingRenewal(BaseModel):
    id: int
    contract_id: int
    contract_title: str
    renewal_date: date
    previous_expiry_date: date
    new_expiry_date: date
    status: str
