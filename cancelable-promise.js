const getFunction = (fn, message = "Argument must be a function") => {
    if (typeof fn !== "function") throw new Error(message);
}

class CancelablePromise {
    constructor(
        callback,
        currentPromise = null,
        isCanceled = false,
        promisesChain = []
    ) {
        if (!currentPromise) getFunction(callback);

        this.isCanceled = isCanceled;

        this._currentPromise =
            currentPromise ??
            new Promise((resolve, reject) => {
                callback((result) => {
                    if (this.isCanceled) reject({ isCanceled: this.isCanceled });
                    else resolve(result);
                }, reject);
            });

        this._promisesChain = promisesChain;
        this._promisesChain.push(this);
    }

    then(onCompleted = (res) => res, onError) {
        getFunction(onCompleted);

        const { _currentPromise } = this;

        const nextPromise = _currentPromise
            .then(onCompleted, onError)
            .catch(onError);

        return new CancelablePromise(
            null,
            nextPromise,
            this.isCanceled,
            this._promisesChain
        );
    }
    catch(onError) {
        return this.then(undefined, onError);
    }
    cancel() {
        this._promisesChain.forEach((promise) => (promise.isCanceled = true));

        return this;
    }
}

module.exports = CancelablePromise;