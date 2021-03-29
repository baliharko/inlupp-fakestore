$(document).ready(() => {

    const endPoint = 'https://webacademy.se/fakestore/';
    // const endPoint = 'https://fakestoreapi.com/products';
    const aboutModal = document.createElement('div');
    const getCartItemsTotal = () => cart.reduce((acc, val) => (acc += val.price), 0);
    const getCartVAT = () => getCartItemsTotal() * 0.25;
    const getCartTotal = () => getCartItemsTotal() + getCartVAT();    
    const updateNavCartAmount = () => $('.navCartAmount').html(`(${cart.length})`); 

    let allProducts = [];

    load();

    let cart = (localStorage.getItem('cart') === null) ? [] : JSON.parse(localStorage.getItem('cart'));

    console.log(cart);

    setCartPage();

    // debug
    $('#clearLsBtn').on('click', clearLocalstorage);
    $('#clearLsBtn').hide();
    
    function setCartPage() {
       if(cart && cart.length >= 1) {
           $('#emptyCart').hide(); 
           $('#activeCart').show();
       } else {
           $('#activeCart').hide();
           $('#emptyCart').show();
       };
    }
        
    function load() {
        fetch(endPoint)
        .then(response => response.json())
        .then(json => render(json))
        .catch(err => console.error(err));
    };

    function render(data) {
        let output = "";
        allProducts = data;

        populateCartTable();        

        data.forEach((product) => {
            output += `
           <div class="card m-4 p-0" style="width: 22rem">
             <img
               class="card-img-top img-fluid"
               src="${product.image}"
               alt="product image"
             />
             <div class="card-body flex-column d-flex justify-content-between">
                <div>
                   <h5 class="card-title">${product.title}</h5>
                   <p class="card-text small">${product.description}</p>
                </div>
                <div class="d-flex flex-column align-items-center">
                   <p class="lead mt-5 mb-3">${product.price.toFixed(2)} kr</p>
                   <button style="width: 10rem;" class="btn btn-outline-secondary addToCartBtn" id="${product.id}">Add to Cart</button>
                </div>
             </div>
           </div>`;                          
        });

        updateOrderModal();

        $('#productView').html(output);

        $('.addToCartBtn').on('click', function() {                      
          const selected = allProducts.find(item => item.id === Number(this.id));
          cart.push(selected);          

          updateNavCartAmount();
          localStorage.setItem('cart', JSON.stringify(cart));                   
          $(this).blur(); // Tar bort fokus på knappen när den blivit klickad på
        });  

        updateNavCartAmount();
    }

    // Returnerar antal av vald produkt i cart
    function getProductAmount(product) {
        return cart.reduce((acc, val) => (val.id === Number(product.id) ? acc + 1 : acc), 0);     
    }

    function populateCartTable() {
        const countedIds = [];

        for(let i = 0; i < cart.length; i++) {
            if(!countedIds.includes(Number(cart[i].id))) {
                $('#cartTable tr:last').after(
                    `<tr>
						<td class="prodId">${cart[i].id}</td>
                    	<td class="col-1 p-1 d-none d-md-table-cell">
                           <img
                           src="${cart[i].image}"
                           class="img-fluid p-0 m-0"
                           alt="product image"
                           style="width: 4rem"
                           />
                        </td>
                        <td class="pr-0 pr-md-4 col-md-5">${cart[i].title}</td>
                        <td class="col-md-3">
                            <div class="d-flex justify-content-center">
                                <button class="btn close ml-0 mr-2 mx-md-3 productPlus" type="button">
                                    <span style="font-size: 22px;">&plus;</span>
                                </button>
                                <p class="p-0 m-0 amountCount">${getProductAmount(cart[i])}</p>
                                <button class="btn close mr-0 ml-2 mx-md-3 productMinus" type="button">
                                    <span style="font-size: 22px;">&minus;</span>
                                </button>
                            </div>
                        </td>
                        <td class="col-md-2">${cart[i].price.toFixed(2)} kr/st</td>
                        <td class="d-none d-md-table-cell col-1">
                            <button class="close removeItemBtn" type="button">
                               &times;
                            </button>
                        </td>
                    </tr>
                `);

                countedIds.push(Number(cart[i].id));
            }
        }


    
		$('.prodId').hide();
        $('.removeItemBtn').on('click', removeProduct);
        $('.productPlus').on('click', increaseProductAmount);
        $('.productMinus').on('click', decreaseProductAmount);

        updateOrderTotal();
    }

    function removeProduct() {
        const productId = $(this).closest('tr').find('.prodId').text();
        cart = cart.filter(item => item.id !== Number(productId));

	    localStorage.setItem('cart', JSON.stringify(cart));
        $(this).closest('tr').remove();

        updateNavCartAmount();
        updateOrderTotal();
        updateOrderModal();
        setCartPage();
    };

    function updateOrderModal() {

        $('#orderFormsModalBody tbody').html('');
        let countedIds = [];

        for(let i = 0; i < cart.length; i++) {
           if(!countedIds.includes(Number(cart[i].id))) { 
            $('#orderFormsModalBody tbody').append(
                `<tr class="table-light d-flex justify-content">						                    
                    <td class="py-1 text-start small col-6">${cart[i].title}</td>
                    <td class="py-1 small col-2">                            
                        <p class="p-0 m-0 amountCount">${getProductAmount(cart[i])}x</p>                        
                    </td>
                    <td class="py-1 small col-4">${cart[i].price.toFixed(2)} kr/st</td>
                </tr>
                `);
                countedIds.push(cart[i].id);
            }
        }
    }

    function increaseProductAmount() {
        const productId = $(this).closest('tr').find('.prodId').text();                
        cart.push(cart.find(item => item.id === Number(productId)));
        localStorage.setItem('cart', JSON.stringify(cart));        

        const productIndex = cart.indexOf(cart.find(val => val.id === Number(productId)));        
        $(this).closest('tr').find('.amountCount').html(`<p class="p-0 m-0 amountCount">${getProductAmount(cart[productIndex])}</p>`);
        updateNavCartAmount();
        updateOrderTotal();
        updateOrderModal();
    }

    function decreaseProductAmount() {
        let productAmount;
        const productId = $(this).closest('tr').find('.prodId').text();        

        if((productAmount = cart.reduce((acc, val) => (val.id === Number(productId) ? acc + 1 : acc), 0)) > 1) {
            const productIndex = cart.indexOf(cart.find(item => item.id === Number(productId)));
            cart.splice(productIndex, 1);
            localStorage.setItem('cart', JSON.stringify(cart));            
            $(this).closest('tr').find('.amountCount').html(`<p class="p-0 m-0 amountCount">${productAmount - 1}</p>`);
        } else {
            $(this).closest('tr').find('.removeItemBtn').trigger('click'); // Simulerar klick på x-knappen
        }

        updateNavCartAmount();
        updateOrderTotal();
        updateOrderModal();
        setCartPage();
    }    

    function updateOrderTotal() {
        $('#itemTotal').html(`<p class="m-0">${getCartItemsTotal().toFixed(2)} kr</p>`);
        $('#vat').html(`<p class="m-0">${getCartVAT().toFixed(2)} kr</p>`);
        $('#total').html(`<p class="lead m-0">${getCartTotal().toFixed(2)} kr</p>`);
    }

    // Debug - rensar localstorage och laddar om sidan
    function clearLocalstorage() {
        localStorage.clear();        
        window.location.reload(true); // Vill ladda om ordentligt
        console.log('cleared localstorage & reloaded page');
    }

    aboutModal.innerHTML = `
          <div id="aboutModal" class="modal fade" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content text-center">
                <div class="modal-header align-self-center">
                  <h5 class="modal-title m-2">About</h5>
                </div>
                <div class="modal-body">
                  <p class="lead">You won't find a store more fake than this...</p>
                  <p class="mx-5 mt-2 mb-4">
                    A fake store fetching data from an API and implementing basic
                    ecommerce functionality.
                  </p>
                  <button class="btn btn-outline-secondary" id="exitAboutModal">
                    Cool!
                  </button>
                </div>
                <div class="modal-footer d-flex justify-content-start">
                  <p class="small my-0" style="font-size: xx-small">
                    baliharko - 2021
                  </p>
                </div>
              </div>
            </div>
          </div>
    `;

    document.body.insertAdjacentElement('beforeend', aboutModal);

    $('#aboutModalBtn').click(() => $('#aboutModal').modal('show'));
    $('#exitAboutModal').click(() => $('#aboutModal').modal('hide'));

    $('#openOrderFormsBtn').click(() => $('#orderFormsModal').modal('show'));
    $('#placeOrderBtn').click(validateOrderForms);

    function validateOrderForms() {

        $('#nameInputField').removeClass('is-invalid'); 
        $('#addressInputField').removeClass('is-invalid');
        $('#emailInputField').removeClass('is-invalid');
        $('#phoneInputField').removeClass('is-invalid');

        $('#invalidNameMessage').hide();
        $('#invalidPhoneMessage').hide();
        $('#invalidEmailMessage').hide();
        $('#invalidAddressMessage').hide();

        const name = $('#nameInputField').val();
        const address = $('#addressInputField').val();        
        const phone = $('#phoneInputField').val().match(/^[\d\s\(\)\-+]+$/);
        const email = $('#emailInputField').val().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        
        if (!(name && name.trim())) {
            $('#nameInputField').val('');
            $('#nameInputField').addClass('is-invalid');            
            $('#invalidNameMessage').show();
        }

        if(!phone) {
            $('#phoneInputField').val('');
            $('#phoneInputField').addClass('is-invalid');
            $('#invalidPhoneMessage').show();
        }

        if(!(address && address.trim())) {
            $('#addressInputField').val('');
            $('#addressInputField').addClass('is-invalid');
            $('#invalidAddressMessage').show();
        }

        if(!email) {
            $('#emailInputField').val('');
            $('#emailInputField').addClass('is-invalid');
            $('#invalidEmailMessage').show();
        }

        if(name && name.trim() && phone && address && address.trim() && email) {
            finishOrder();                        
        }
    };


    function finishOrder() {

        // ----> SKICKA VIDARE TILL KLARNA HÄR <-----

        $('#orderFormsModal').modal('hide');
        $('#orderFormsModalBody').hide();            
        
        $('#orderFormsModal').one('hidden.bs.modal', () => {
            
            localStorage.clear();      
            cart = [];
            $('#thankYouModalBody').show();
            $('#orderFormsModal').modal('show');
            $('#activeCart').hide();
            $('#emptyCart').show();            
            updateNavCartAmount();
        });         
    }

    $('#thankYouModalBody').hide();
    $('#invalidNameMessage').hide();
    $('#invalidPhoneMessage').hide();
    $('#invalidEmailMessage').hide();
    $('#invalidAddressMessage').hide(); 
});
