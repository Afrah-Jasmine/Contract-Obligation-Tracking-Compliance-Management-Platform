import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompliancePage } from './compliance-page';

describe('CompliancePage', () => {
  let component: CompliancePage;
  let fixture: ComponentFixture<CompliancePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompliancePage],
    }).compileComponents();

    fixture = TestBed.createComponent(CompliancePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
