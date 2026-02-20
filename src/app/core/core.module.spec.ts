import { TestBed } from '@angular/core/testing';
import { CoreModule } from './core.module';

describe('CoreModule', () => {
  let coreModule: CoreModule;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoreModule]
    });
    coreModule = TestBed.inject(CoreModule);
  });

  it('should be created', () => {
    expect(coreModule).toBeTruthy();
  });

  it('should throw if imported more than once', () => {
    // This is hard to test with TestBed as it handles singleton nature differently,
    // but we can try manually instantiating.
    expect(() => new CoreModule(new CoreModule(undefined))).toThrowError(
      'CoreModule is already loaded. Import it in the AppModule only'
    );
  });
});
