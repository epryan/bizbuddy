const MAXBILLABLES = 5;

var nextId = 1;
// Display the next available billable item in the form
function showNextBillable() {
  if (nextId < MAXBILLABLES) {
    var billableId = '#billable_' + nextId;
    //$(billable_id).removeClass('hidden')
    $(billableId).show()
    nextId++;
  }
}

function truncateAmount(elem) {
  if (elem && elem.value) {
    elem.value = parseFloat(elem.value).toFixed(2);
  }
}

// TODO: refactor to make this horribly ugly code pretty
function truncateAndUpdateTotal(elem) {
  truncateAmount(elem);
  // The grandparent of the quantity/unit_price elements are the div: 'billable_n'
  var billableN = elem.parentElement.parentElement;
  // The 2nd form element is the quantity (index 1)
  // The 3rd form element is the unit_price (index 2)
  // The 4th form element is the total_price form group (index 3)
  // The 2nd element is the input element (index 1)
  var elemQuantity = billableN.childNodes[1].childNodes[1];
  var elemUnitPrice = billableN.childNodes[2].childNodes[1];
  var elemTotalPrice = billableN.childNodes[3].childNodes[1];

  if (elemQuantity.value && elemUnitPrice.value) {
    elemTotalPrice.value = elemQuantity.value * elemUnitPrice.value;
    truncateAmount(elemTotalPrice);
  }
}

// Sum the subtotals in a hidden element and post the form
function validateForm() {

  // Collect the subtotals and store them in the hidden invoice_total element
  var subTotals = document.getElementById("form_invoice").elements['total_price'];
  var total = 0;

  for (i = 0; i < subTotals.length; i++) {
    if (subTotals[i] && subTotals[i].value) {
      total += parseFloat(subTotals[i].value);
    }
  }

  document.getElementById("invoice_total").value = total;

  // POST the form to the server
  document.getElementById("form_invoice").submit();
}

// function setTotalListeners() {
//     for (var i = 0; i < MAXBILLABLES; i++) {
//       var id = 'billable_' + i + '_total_price';
//       var element = document.getElementById(id);
//       element.oninput = updateTotal(i);
//     }
// }
//
// function updateTotal(idToWatch) {
//   var quantity = document.getElementById('billable_' + idToWatch + '_quantity');
//   var unitPrice = document.getElementById('billable_' + idToWatch + '_unit_price');
//   var totalPrice = document.getElementById('billable_' + idToWatch + '_total_price');
//   if (quantity && quantity.value > 0 && unitPrice && unitPrice.value > 0) {
//     totalPrice.value = quantity.value * unitPrice.value;
//   }
// }
