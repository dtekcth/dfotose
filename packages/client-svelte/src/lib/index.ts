export function progress(formElement: HTMLFormElement, cb: (event: ProgressEvent) => void) {
	function handleSubmit(event: Event) {
		event.preventDefault();
		const formData = new FormData(formElement);

		const xhr = new XMLHttpRequest();
		xhr.open('POST', formElement.action);
		xhr.upload.addEventListener('progress', cb);
		xhr.send(formData);
	}

	formElement.addEventListener('submit', handleSubmit);
	return {
		destroy() {
			formElement.removeEventListener('submit', handleSubmit);
		}
	};
}

/**
 * Gets the form data as a JSON object and gives it to the callback.
 * @param formElement The form element to get the data from
 * @param cb Submit callback
 */
export function json<T extends Record<string, string>>(
	formElement: HTMLFormElement,
	cb: (data: T) => Promise<void>
) {
	async function handleSubmit(event: Event) {
		event.preventDefault();
		const formData = new FormData(formElement);
		const data: Record<string, string> = {};
		for (const [name, value] of formData) {
			if (value instanceof File) continue;
			data[name] = value;
		}
		await cb(data as T);
	}

	formElement.addEventListener('submit', handleSubmit);
	return {
		destroy() {
			formElement.removeEventListener('submit', handleSubmit);
		}
	};
}
