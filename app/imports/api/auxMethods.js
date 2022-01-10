export function makeArrayOf(value, length) {
  let arr = [],
    i = length;
  while (i--) {
    arr[i] = value;
  }
  return arr;
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}