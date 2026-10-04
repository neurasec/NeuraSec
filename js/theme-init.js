/* Runs in <head> before first paint: applies the saved colour theme and the
   "pause animations" preference so there is no flash of the wrong theme. */
(function () {
  try {
    var t = localStorage.getItem('neurasec-theme');
    if (t) document.documentElement.dataset.theme = t;
    if (localStorage.getItem('neurasec-motion') === 'off') document.documentElement.classList.add('motion-off');
  } catch (e) { /* storage blocked: defaults apply */ }
})();
