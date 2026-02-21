import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RiskModelService, RiskEvaluationError } from './risk-model.service';
import { RiskEvaluationResponse } from '../../models/academic-risk.model';

describe('RiskModelService', () => {
  let service: RiskModelService;
  let httpMock: HttpTestingController;
  const apiUrl = '/api/risk/evaluate';

  const mockSuccessResponse: RiskEvaluationResponse = {
    status: 'success',
    prediction: {
      riskScore: 0,
      riskProbability: 0.12,
      riskLabel: 'Low Risk',
      riskEvaluatedAt: '2026-02-21T00:00:00.000Z'
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RiskModelService]
    });
    service = TestBed.inject(RiskModelService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return risk evaluation result on success', () => {
    service.evaluateStudentRisk(1).subscribe(result => {
      expect(result.riskLabel).toBe('Low Risk');
      expect(result.riskProbability).toBe(0.12);
      expect(result.riskScore).toBe(0);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('POST');
    req.flush(mockSuccessResponse);
  });

  it('should throw RiskEvaluationError on invalid response (status not success)', () => {
    service.evaluateStudentRisk(1).subscribe({
      next: () => fail('should have failed'),
      error: (err: RiskEvaluationError) => {
        expect(err.errorType).toBe('server');
        expect(err.message).toContain('Invalid response');
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    req.flush({ status: 'error', prediction: null });
  });

  it('should throw RiskEvaluationError on invalid response (no prediction)', () => {
    service.evaluateStudentRisk(1).subscribe({
      next: () => fail('should have failed'),
      error: (err: RiskEvaluationError) => {
        expect(err.errorType).toBe('server');
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    req.flush({ status: 'success', prediction: null });
  });

  it('should classify 404 as not_found', () => {
    service.evaluateStudentRisk(999).subscribe({
      next: () => fail('should have failed'),
      error: (err: RiskEvaluationError) => {
        expect(err.errorType).toBe('not_found');
        expect(err.statusCode).toBe(404);
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/999`);
    req.flush({ status: 'error', message: 'Student not found' }, { status: 404, statusText: 'Not Found' });
  });

  it('should classify 400 as validation error', () => {
    service.evaluateStudentRisk(1).subscribe({
      next: () => fail('should have failed'),
      error: (err: RiskEvaluationError) => {
        expect(err.errorType).toBe('validation');
        expect(err.statusCode).toBe(400);
        expect(err.message).toBe('Missing required columns');
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    req.flush({ status: 'error', message: 'Missing required columns' }, { status: 400, statusText: 'Bad Request' });
  });

  it('should classify 400 with no message using default message', () => {
    service.evaluateStudentRisk(1).subscribe({
      next: () => fail('should have failed'),
      error: (err: RiskEvaluationError) => {
        expect(err.errorType).toBe('validation');
        expect(err.message).toBe('Invalid student data for risk evaluation');
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    req.flush({}, { status: 400, statusText: 'Bad Request' });
  });

  it('should classify 503 as model_unavailable after retries', fakeAsync(() => {
    service.evaluateStudentRisk(1).subscribe({
      next: () => fail('should have failed'),
      error: (err: RiskEvaluationError) => {
        expect(err.errorType).toBe('model_unavailable');
        expect(err.statusCode).toBe(503);
      }
    });

    const req1 = httpMock.expectOne(`${apiUrl}/1`);
    req1.flush({ status: 'error', message: 'No model loaded' }, { status: 503, statusText: 'Service Unavailable' });
    tick(1000);

    const req2 = httpMock.expectOne(`${apiUrl}/1`);
    req2.flush({ status: 'error', message: 'No model loaded' }, { status: 503, statusText: 'Service Unavailable' });
    tick(2000);

    const req3 = httpMock.expectOne(`${apiUrl}/1`);
    req3.flush({ status: 'error', message: 'No model loaded' }, { status: 503, statusText: 'Service Unavailable' });
  }));

  it('should classify 504 as timeout after retries', fakeAsync(() => {
    service.evaluateStudentRisk(1).subscribe({
      next: () => fail('should have failed'),
      error: (err: RiskEvaluationError) => {
        expect(err.errorType).toBe('timeout');
        expect(err.statusCode).toBe(504);
      }
    });

    const req1 = httpMock.expectOne(`${apiUrl}/1`);
    req1.flush({}, { status: 504, statusText: 'Gateway Timeout' });
    tick(1000);

    const req2 = httpMock.expectOne(`${apiUrl}/1`);
    req2.flush({}, { status: 504, statusText: 'Gateway Timeout' });
    tick(2000);

    const req3 = httpMock.expectOne(`${apiUrl}/1`);
    req3.flush({}, { status: 504, statusText: 'Gateway Timeout' });
  }));

  it('should classify 502 as server error after retries', fakeAsync(() => {
    service.evaluateStudentRisk(1).subscribe({
      next: () => fail('should have failed'),
      error: (err: RiskEvaluationError) => {
        expect(err.errorType).toBe('server');
        expect(err.statusCode).toBe(502);
      }
    });

    const req1 = httpMock.expectOne(`${apiUrl}/1`);
    req1.flush({}, { status: 502, statusText: 'Bad Gateway' });
    tick(1000);

    const req2 = httpMock.expectOne(`${apiUrl}/1`);
    req2.flush({}, { status: 502, statusText: 'Bad Gateway' });
    tick(2000);

    const req3 = httpMock.expectOne(`${apiUrl}/1`);
    req3.flush({}, { status: 502, statusText: 'Bad Gateway' });
  }));

  it('should classify network error (status 0) as network after retries', fakeAsync(() => {
    service.evaluateStudentRisk(1).subscribe({
      next: () => fail('should have failed'),
      error: (err: RiskEvaluationError) => {
        expect(err.errorType).toBe('network');
        expect(err.statusCode).toBe(0);
      }
    });

    const req1 = httpMock.expectOne(`${apiUrl}/1`);
    req1.error(new ProgressEvent('error'), { status: 0 });
    tick(1000);

    const req2 = httpMock.expectOne(`${apiUrl}/1`);
    req2.error(new ProgressEvent('error'), { status: 0 });
    tick(2000);

    const req3 = httpMock.expectOne(`${apiUrl}/1`);
    req3.error(new ProgressEvent('error'), { status: 0 });
  }));

  it('should classify unknown HTTP errors as server', () => {
    service.evaluateStudentRisk(1).subscribe({
      next: () => fail('should have failed'),
      error: (err: RiskEvaluationError) => {
        expect(err.errorType).toBe('server');
        expect(err.statusCode).toBe(500);
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    req.flush({ message: 'Internal error' }, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should classify unknown HTTP errors with no message body', () => {
    service.evaluateStudentRisk(1).subscribe({
      next: () => fail('should have failed'),
      error: (err: RiskEvaluationError) => {
        expect(err.errorType).toBe('server');
        expect(err.message).toBe('Risk evaluation failed');
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should not retry on 404', () => {
    service.evaluateStudentRisk(1).subscribe({
      next: () => fail('should have failed'),
      error: (err: RiskEvaluationError) => {
        expect(err.errorType).toBe('not_found');
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    req.flush({}, { status: 404, statusText: 'Not Found' });
    httpMock.expectNone(`${apiUrl}/1`);
  });

  it('should not retry on 400', () => {
    service.evaluateStudentRisk(1).subscribe({
      next: () => fail('should have failed'),
      error: (err: RiskEvaluationError) => {
        expect(err.errorType).toBe('validation');
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    req.flush({}, { status: 400, statusText: 'Bad Request' });
    httpMock.expectNone(`${apiUrl}/1`);
  });
});
