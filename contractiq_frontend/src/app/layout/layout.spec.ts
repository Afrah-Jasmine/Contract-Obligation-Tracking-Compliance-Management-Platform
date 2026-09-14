import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Layout } from './layout';

describe('Layout', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Layout],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Layout);
    const layout = fixture.componentInstance;

    expect(layout).toBeTruthy();
  });
});