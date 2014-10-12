exports.reward = function(s1, s2) {

}

exports.need = function(bikes, docks, threshold) {
  ideal = threshold * docks;
  ideal = Math.round(ideal);
  return bikes-ideal;
}
