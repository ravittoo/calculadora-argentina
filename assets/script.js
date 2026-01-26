// Configuración: Estos son los dólares que queremos mostrar y en qué orden
// 'casa' debe coincidir con el nombre que usa la API (oficial, blue, bolsa, cripto, tarjeta)
        const TIPOS_INTERES = ['blue', 'oficial', 'bolsa'];
        const NOMBRES = {
            'blue': 'Dólar Blue',
            'oficial': 'Dólar Oficial',
            'bolsa': 'Dólar MEP',
        };

        let cotizaciones = {};

        async function iniciarApp() {
            try {
                const response = await fetch('https://dolarapi.com/v1/dolares');
                const data = await response.json();
                
                document.getElementById('loading').style.display = 'none';
                const container = document.getElementById('dollarContainer');

                // Filtramos y ordenamos según nuestra lista TIPOS_INTERES
                TIPOS_INTERES.forEach(tipo => {
                    const dolarData = data.find(d => d.casa === tipo);
                    if (dolarData) {
                        // Guardamos datos en memoria
                        const promedio = (dolarData.compra + dolarData.venta) / 2;
                        cotizaciones[tipo] = { ...dolarData, promedio };
                        
                        // Generamos el HTML
                        container.innerHTML += crearHTMLDolar(tipo, dolarData, promedio);
                    }
                });

            } catch (error) {
                document.getElementById('loading').innerText = "Error de conexión. Recargá la página.";
            }
        }

        function crearHTMLDolar(tipo, data, promedio) {
            return `
                <div class="dollar-item">
                    <button class="accordion-btn" onclick="togglePanel('${tipo}')">
                        <span class="dolar-title">${NOMBRES[tipo]}</span>
                        <span class="dolar-badge">$${data.venta}</span>
                    </button>
                    
                    <div id="panel-${tipo}" class="panel">
                        <div class="stats-grid">
                            <div class="stat-box">
                                <small>Compra</small>
                                <strong>$${data.compra}</strong>
                            </div>
                            <div class="stat-box">
                                <small>Venta</small>
                                <strong>$${data.venta}</strong>
                            </div>
                            <div class="stat-box promedio">
                                <small>Promedio</small>
                                <strong>$${promedio.toFixed(2)}</strong>
                            </div>
                        </div>

                        <div class="converter-row">
                            <div class="input-wrapper">
                                <label>🇦🇷 Pesos</label>
                                <input type="number" id="ars-${tipo}" placeholder="0" oninput="calcular('${tipo}', 'ars')">
                            </div>
                            <div class="exchange-icon">⇄</div>
                            <div class="input-wrapper">
                                <label>🇺🇸 Dólares</label>
                                <input type="number" id="usd-${tipo}" placeholder="0" oninput="calcular('${tipo}', 'usd')">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function togglePanel(tipo) {
            // Cerrar todos los demás
            document.querySelectorAll('.panel').forEach(p => {
                if(p.id !== `panel-${tipo}`) p.classList.remove('show');
            });
            document.querySelectorAll('.accordion-btn').forEach(b => b.classList.remove('active'));

            // Abrir el actual
            const panel = document.getElementById(`panel-${tipo}`);
            const btn = document.querySelector(`button[onclick="togglePanel('${tipo}')"]`);
            
            if (panel.classList.contains('show')) {
                panel.classList.remove('show');
                btn.classList.remove('active');
            } else {
                panel.classList.add('show');
                btn.classList.add('active');
            }
        }

        function calcular(tipo, origen) {
            const inputArs = document.getElementById(`ars-${tipo}`);
            const inputUsd = document.getElementById(`usd-${tipo}`);
            const precio = cotizaciones[tipo].venta; // Usamos VENTA como referencia estándar

            if (origen === 'ars') {
                // Tengo Pesos -> Quiero Dólares
                const val = parseFloat(inputArs.value);
                if (!val) { inputUsd.value = ''; return; }
                inputUsd.value = (val / precio).toFixed(2);
            } else {
                // Tengo Dólares -> Quiero Pesos
                const val = parseFloat(inputUsd.value);
                if (!val) { inputArs.value = ''; return; }
                inputArs.value = (val * precio).toFixed(2);
            }
        }

        // Arrancar
        iniciarApp();