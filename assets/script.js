let cotizaciones = {};

        // Función para obtener precios reales de DolarApi.com
        async function obtenerCotizaciones() {
            try {
                const response = await fetch('https://dolarapi.com/v1/dolares');
                const data = await response.json();
                
                const select = document.getElementById('tipoDolar');
                data.forEach(dolar => {
                    cotizaciones[dolar.casa] = dolar.venta;
                    let option = document.createElement('option');
                    option.value = dolar.casa;
                    option.text = `Dólar ${dolar.nombre}`;
                    select.appendChild(option);
                });
                
                document.getElementById('status').innerText = "Cotizaciones actualizadas";
                convertir();
            } catch (error) {
                document.getElementById('status').innerText = "Error al cargar datos";
            }
        }

        function convertir() {
            const usd = parseFloat(document.getElementById('usdInput').value) || 0;
            const tipo = document.getElementById('tipoDolar').value;
            const venta = cotizaciones[tipo] || 0;
            
            const total = usd * venta;
            
            document.getElementById('arsOutput').innerText = `$ ${total.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;
            document.getElementById('cotizacionInfo').innerText = `Cotización: $${venta}`;
        }

        obtenerCotizaciones();