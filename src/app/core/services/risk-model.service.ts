import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { map, catchError, timeout, retry, mergeMap } from 'rxjs/operators';
import { RiskEvaluationResult, RiskEvaluationResponse } from '../../models/academic-risk.model';

export type RiskErrorType = 'timeout' | 'network' | 'not_found' | 'model_unavailable' | 'validation' | 'server';

export class RiskEvaluationError extends Error {
  constructor(
    message: string,
    public readonly errorType: RiskErrorType,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'RiskEvaluationError';
  }
}

@Injectable({
  providedIn: 'root'
})
export class RiskModelService {
  private readonly apiUrl = '/api/risk/evaluate';
  private readonly timeoutMs = 30000;
  private readonly maxRetries = 2;

  constructor(private http: HttpClient) {}

  evaluateStudentRisk(studentId: number): Observable<RiskEvaluationResult> {
    return this.http.post<RiskEvaluationResponse>(`${this.apiUrl}/${studentId}`, {}).pipe(
      timeout(this.timeoutMs),
      retry({
        count: this.maxRetries,
        delay: (error, retryCount) => {
          if (this.isRetryable(error)) {
            return timer(1000 * retryCount);
          }
          return throwError(() => error);
        }
      }),
      map(response => {
        if (response.status !== 'success' || !response.prediction) {
          throw new RiskEvaluationError('Invalid response from risk evaluation', 'server');
        }
        return response.prediction;
      }),
      catchError(error => throwError(() => this.classifyError(error)))
    );
  }

  private isRetryable(error: unknown): boolean {
    if (error instanceof HttpErrorResponse) {
      return error.status === 502 || error.status === 503 || error.status === 504 || error.status === 0;
    }
    return false;
  }

  private classifyError(error: unknown): RiskEvaluationError {
    if (error instanceof RiskEvaluationError) {
      return error;
    }

    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return new RiskEvaluationError('Unable to reach the risk model service', 'network', 0);
      }
      if (error.status === 404) {
        return new RiskEvaluationError('Student not found', 'not_found', 404);
      }
      if (error.status === 503) {
        return new RiskEvaluationError('Risk model is not available', 'model_unavailable', 503);
      }
      if (error.status === 504) {
        return new RiskEvaluationError('Risk model evaluation timed out', 'timeout', 504);
      }
      if (error.status === 400) {
        const msg = error.error?.message || 'Invalid student data for risk evaluation';
        return new RiskEvaluationError(msg, 'validation', 400);
      }
      if (error.status === 502) {
        return new RiskEvaluationError('Risk model service returned an error', 'server', 502);
      }
      return new RiskEvaluationError(
        error.error?.message || 'Risk evaluation failed',
        'server',
        error.status
      );
    }

    if (error instanceof Error && error.name === 'TimeoutError') {
      return new RiskEvaluationError('Risk model evaluation timed out', 'timeout');
    }

    return new RiskEvaluationError('An unexpected error occurred during risk evaluation', 'server');
  }
}
