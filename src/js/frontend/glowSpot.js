const glowSpot = document.querySelector('.glow-spot');
const blockDiv = document.getElementById('blockDiv');

if (glowSpot && blockDiv) {
  const defaultPosition = {
    left: '50%',
    top: '0',
    transform: 'translateX(-50%)',
  };

  let restoreTimeout;

  const isLandingVisible = () => !blockDiv.classList.contains('disappear');

  const resetGlowSpotPosition = () => {
    glowSpot.style.left = defaultPosition.left;
    glowSpot.style.top = defaultPosition.top;
    glowSpot.style.transform = defaultPosition.transform;
  };

  const updateGlowSpotPosition = (event) => {
    if (!isLandingVisible()) {
      return;
    }

    glowSpot.classList.remove('glow-spot--off');
    glowSpot.style.left = `${event.clientX}px`;
    glowSpot.style.top = `${event.clientY}px`;
    glowSpot.style.transform = 'translate(-50%, -50%)';
  };

  const fadeToDefaultPosition = () => {
    glowSpot.classList.add('glow-spot--off');

    clearTimeout(restoreTimeout);
    restoreTimeout = setTimeout(() => {
      resetGlowSpotPosition();
      glowSpot.classList.remove('glow-spot--off');
    }, 200);
  };

  const observer = new MutationObserver(() => {
    if (isLandingVisible()) {
      glowSpot.classList.remove('glow-spot--off');
    } else {
      fadeToDefaultPosition();
    }
  });

  observer.observe(blockDiv, { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('mousemove', updateGlowSpotPosition);
}
