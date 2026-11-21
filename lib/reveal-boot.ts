/** Runs before paint: hide reveal targets only when JS is alive, with a safety net. */
export const revealBootScript = `(function(){var d=document.documentElement;d.classList.add('js-reveal');setTimeout(function(){if(!window.__revealReady)d.classList.remove('js-reveal')},3000)})();`;
