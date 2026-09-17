from typing import Optional

from pydantic import BaseModel


class ReportCreate(BaseModel):
    generated_by: int | None = None
    report_name: str
    report_type: str
    file_path: str | None = None


class ReportResponse(BaseModel):
    id: int
    generated_by: Optional[int]
    report_name: str
    report_type: str
    file_path: str

    class Config:
        from_attributes = True