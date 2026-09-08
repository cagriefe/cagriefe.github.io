// Receipt timestamp. That's the whole script.
(function () {
  "use strict";
  var el = document.getElementById("receipt-date");
  if (!el) return;
  var d = new Date();
  var p = function (n) { return (n < 10 ? "0" : "") + n; };
  el.textContent =
    p(d.getDate()) + "." + p(d.getMonth() + 1) + "." + d.getFullYear() +
    " " + p(d.getHours()) + ":" + p(d.getMinutes());
})();
