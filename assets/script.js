// Configuración: Estos son los dólares que queremos mostrar y en qué orden
// 'casa' debe coincidir con el nombre que usa la API (oficial, blue, bolsa, cripto, tarjeta)
const TIPOS_INTERES = ['blue', 'oficial', 'bolsa'];
        const NOMBRES = {'blue': 'Dólar Blue', 'oficial': 'Dólar Oficial', 'bolsa': 'Dólar MEP'};
        let cotizaciones = {};

        async function iniciarApp() {
            try {
                const response = await fetch('https://dolarapi.com/v1/dolares');
                const data = await response.json();
                document.getElementById('loading').style.display = 'none';
                const container = document.getElementById('dollarContainer');

                TIPOS_INTERES.forEach(tipo => {
                    const dolarData = data.find(d => d.casa === tipo);
                    if (dolarData) {
                        cotizaciones[tipo] = { compra: dolarData.compra, venta: dolarData.venta };
                        container.innerHTML += crearHTMLDolar(tipo, dolarData);
                    }
                });
            } catch (error) { document.getElementById('loading').innerText = "Error. Recargá la página."; }
        }

        function crearHTMLDolar(tipo, data) {
    return `
        <div class="dollar-item">
            <button class="accordion-btn" onclick="togglePanel('${tipo}')">
                <span class="dolar-title">${NOMBRES[tipo]}</span>
                <span class="dolar-badge" id="badge-${tipo}">$${new Intl.NumberFormat('es-AR').format(data.venta)}</span>
            </button>
            <div id="panel-${tipo}" class="panel">
                <div class="stats-grid">
                    <div class="stat-box"><small>Compra</small><strong>$${data.compra}</strong></div>
                    
                    <div class="stat-box">
                        <small>Venta</small>
                        <strong id="precio-${tipo}">$${new Intl.NumberFormat('es-AR').format(data.venta)}</strong>
                    </div>
                    
                    <div class="stat-box"><small>Promedio</small><strong id="promedio-${tipo}">$${((data.compra + data.venta)/2).toFixed(2)}</strong></div>
                </div>
                <div class="converter-row">
                    <div class="input-wrapper">
                        <label>🇦🇷 Pesos</label>
                        <input type="text" id="ars-${tipo}" inputmode="decimal" placeholder="0" oninput="manejarInput(this, '${tipo}', 'ars')">
                    </div>
                    <div class="exchange-icon">⇄</div>
                    <div class="input-wrapper">
                        <label>🇺🇸 Dólares</label>
                        <input type="text" id="usd-${tipo}" inputmode="decimal" placeholder="0" oninput="manejarInput(this, '${tipo}', 'usd')">
                    </div>
                </div>
            </div>
        </div>`;
}

        // --- LÓGICA DE FORMATEO ---

        function manejarInput(elemento, tipo, origen) {
    // 1. Permitimos solo números y UNA coma
    let valor = elemento.value.replace(/[^\d,]/g, ""); // Borra todo menos números y coma
    
    // Evitamos que pongan más de una coma
    let partes = valor.split(",");
    if (partes.length > 2) {
        valor = partes[0] + "," + partes[1];
        partes = [partes[0], partes[1]];
    }

    // 2. Formateamos la parte entera con miles
    if (partes[0]) {
        let enteroFormateado = new Intl.NumberFormat('es-AR').format(partes[0]);
        elemento.value = partes.length > 1 ? enteroFormateado + "," + partes[1] : enteroFormateado;
    }

    // 3. Preparamos el valor para el cálculo (cambiamos coma por punto para JS)
    let valorParaCalculo = valor.replace(",", ".");
    if (valorParaCalculo && !isNaN(valorParaCalculo)) {
        ejecutarCalculo(tipo, origen, parseFloat(valorParaCalculo));
    }
}

        function ejecutarCalculo(tipo, origen, valorNumerico) {
    const inputArs = document.getElementById(`ars-${tipo}`);
    const inputUsd = document.getElementById(`usd-${tipo}`);
    const precio = cotizaciones[tipo].venta;

    if (origen === 'ars') {
        let resultado = valorNumerico / precio;
        // USD siempre con 2 decimales y coma
        inputUsd.value = new Intl.NumberFormat('es-AR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        }).format(resultado);
    } else {
        let resultado = valorNumerico * precio;
        // ARS lo redondeamos (nadie usa centavos de peso)
        inputArs.value = new Intl.NumberFormat('es-AR').format(Math.round(resultado));
    }
}

        // --- LÓGICA RESTANTE (Acordeón y Edición) ---

        function actualizarPrecioManual(tipo, nuevoValor) {
            const valor = parseFloat(nuevoValor);
            if (!valor) return;
            cotizaciones[tipo].venta = valor;
            document.getElementById(`promedio-${tipo}`).innerText = `$${((cotizaciones[tipo].compra + valor) / 2).toFixed(2)}`;
            document.getElementById(`badge-${tipo}`).innerText = `$${new Intl.NumberFormat('es-AR').format(valor)}`;
        }

        function togglePanel(tipo) {
            document.querySelectorAll('.panel').forEach(p => { if(p.id !== `panel-${tipo}`) p.classList.remove('show'); });
            const panel = document.getElementById(`panel-${tipo}`);
            panel.classList.toggle('show');
        }

        iniciarApp();

