import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { Router } from '@angular/router';

describe('AppRoutes', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes)
      ]
    });
    router = TestBed.inject(Router);
  });

  it('should contain default route', () => {
    const route = router.config.find(r => r.path === '' && r.redirectTo === 'students');
    expect(route).toBeDefined();
  });
});
