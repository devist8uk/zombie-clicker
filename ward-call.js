// The ward and its map preview use the same bell, curtain and reveal timing.
function createWardCall(field, onCue) {
    let phase = '';
    let timer;

    function cue(next) {
        clearTimeout(timer);
        phase = next === 'clear' ? '' : next;
        document.dispatchEvent(new CustomEvent('ward-cue', { detail: { field, phase: next } }));
        onCue(next);
    }

    function clear() {
        if (phase) cue('clear');
    }

    return {
        get phase() { return phase; },
        clear,
        ring() {
            if (phase) return;
            cue('ring');
            timer = setTimeout(clear, 5000);
        },
        answer() {
            if (phase !== 'ring') return false;
            cue('answer');
            timer = setTimeout(() => {
                cue('reveal');
                timer = setTimeout(clear, 3100);
            }, 1150);
            return true;
        }
    };
}
