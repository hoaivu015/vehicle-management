export interface BaseView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
}

/**
 * BasePresenter
 * 
 * Standardizes common presentation logic such as loading states, 
 * error handling, and view lifecycle management.
 */
export abstract class BasePresenter<V extends BaseView> {
  protected view?: V;

  attachView(view: V): void {
    this.view = view;
  }

  detachView(): void {
    this.view = undefined;
  }

  /**
   * Helper to perform an asynchronous action with automatic loading and error handling.
   */
  protected async perform<T>(
    action: () => Promise<T>,
    onSuccess?: (result: T) => void | Promise<void>,
    errorMessage: string = 'Đã xảy ra lỗi'
  ): Promise<void> {
    if (!this.view) return;

    this.view.showLoading();
    try {
      const result = await action();
      if (onSuccess) {
        await onSuccess(result);
      }
    } catch (error: unknown) {
      console.error('[BasePresenter Error]:', error);
      const message = error instanceof Error ? error.message : errorMessage;
      this.view?.showError(message);
    } finally {
      this.view?.hideLoading();
    }
  }
}
