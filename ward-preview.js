(() => {
    const dialog = document.getElementById('ward-preview');
    const field = document.getElementById('ward-preview-field');
    const status = document.getElementById('ward-preview-status');
    const opener = document.getElementById('watch-ward');
    const firstPrompt = 'Strike Patient Zero to wake the ward.';
    let patient;
    let wakeTimer;
    let answered = false;
    let returnFocus;

    const call = createWardCall(field, phase => {
        patient?.cue(phase);
        if (phase === 'ring') {
            field.setAttribute('aria-label', 'Answer the Ward Seven call bell');
            status.textContent = 'The call bell is ringing. Strike to answer.';
        } else if (phase === 'answer') {
            answered = true;
            field.setAttribute('aria-label', 'Ward curtain closing');
            status.textContent = 'A second bell answers from across the ward.';
        } else if (phase === 'reveal') {
            field.setAttribute('aria-label', 'The Night Round. A row of faceless orderlies stands beyond the curtain.');
            status.textContent = 'The last call light comes on above your bed.';
        } else {
            field.setAttribute('aria-label', 'Strike Patient Zero');
            status.textContent = answered ? 'The round is over. Strike to replay.' : 'The bell fell silent. Strike to call again.';
        }
    });

    function openPreview() {
        if (dialog.open) return;
        const mapEntry = document.getElementById('sector-detail');
        if (mapEntry.open) mapEntry.close();
        // Closing the map restores its opener (the hospital sector card).
        returnFocus = document.activeElement === document.body ? document.getElementById('zombie-target') : document.activeElement;
        answered = false;
        status.textContent = firstPrompt;
        field.setAttribute('aria-label', 'Strike Patient Zero');
        dialog.showModal();
        patient = window.mountPatientZero(field);
        field.focus({preventScroll: true});
    }

    field.addEventListener('click', event => {
        if (SoundManager.enabled && !SoundManager.audioContext) SoundManager.init();
        if (SoundManager.audioContext?.state === 'suspended') SoundManager.audioContext.resume().catch(() => {});
        const bounds = field.getBoundingClientRect();
        patient?.strike(event.detail ? {
            x: (event.clientX - bounds.left) / bounds.width,
            y: (event.clientY - bounds.top) / bounds.height
        } : {});
        if (call.answer() || call.phase || wakeTimer) return;
        answered = false;
        status.textContent = 'Somewhere down the hall, a switch clicks.';
        wakeTimer = setTimeout(() => {
            wakeTimer = undefined;
            call.ring();
        }, 780);
    });

    function stopCall() {
        clearTimeout(wakeTimer);
        wakeTimer = undefined;
        call.clear();
    }
    dialog.addEventListener('close', () => {
        stopCall();
        patient?.destroy();
        patient = undefined;
        if (location.hash === '#ward-seven') history.replaceState(null, '', location.pathname + location.search);
        returnFocus?.focus({preventScroll: true});
    });
    dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && dialog.open) {
            stopCall();
            status.textContent = firstPrompt;
        }
    });
    opener.addEventListener('click', openPreview);
    function followWardLink() {
        if (location.hash === '#ward-seven') openPreview();
    }
    window.addEventListener('hashchange', followWardLink);
    followWardLink();
})();
