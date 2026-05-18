# Pokémon Bank

Simulación de interfaz web de un cajero automático (ATM) para la empresa ficticia Pokémon Bank. Fase 2: interfaz funcional con HTML5, CSS3, Bootstrap y JavaScript del lado del cliente.


## Tecnologías usadas

- HTML5 semántico
- CSS3 con variables CSS
- Bootstrap 5.3 (CDN)
- Bootstrap Icons (CDN)
- JavaScript
- LocalStorage y SessionStorage
- ValidateJS
- SweetAlert
- jsPDF
- Chart.js
- Git + GitHub

## Estructura de carpetas

```
pokemon-bank/
├── index.html              # Pantalla de Login (PIN)
├── acciones.html           # Pantalla principal de transacciones
├── historial.html          # Historial de transacciones
├── grafico.html            # Pantalla con placeholder de gráfico
├── css/
│   └── styles.css          # Estilos personalizados
├── js/
│   ├── .gitkeep
│   └── app.js              # Lógica de login, transacciones, PDF y gráfico
├── images/
│   ├── logo.png            # Logo Pokémon Bank
│   └── trainer-avatar.png  # Avatar del usuario
└── README.md
```

## Cómo visualizar

Abrir `index.html` directamente en un navegador web.

```bash
# Ejemplo en macOS
open index.html

# Ejemplo en Linux
xdg-open index.html

# Ejemplo en Windows
start index.html
```

## Flujo de navegación

```
index.html (Login)
    │
    └──> acciones.html (Pantalla principal)
              ├──> historial.html (Historial de transacciones)
              ├──> grafico.html (Análisis de transacciones)
              ├──> [Modal] Depositar
              ├──> [Modal] Retirar
              ├──> [Modal] Consultar saldo
              └──> [Modal] Pagar servicios
```

## Usuario de prueba

- **Nombre:** Ash Ketchum
- **Número de cuenta:** 0987654321
- **PIN:** 1234
- **Saldo inicial:** $500.00

## Funcionalidades de fase 2

- Login por PIN con validación de 4 dígitos.
- Inicialización y persistencia de usuario en LocalStorage.
- Control de sesión con SessionStorage.
- Depósitos, retiros, consulta de saldo y pago de servicios.
- Validación de campos con ValidateJS.
- Diálogos interactivos con SweetAlert.
- Comprobante PDF por transacción con jsPDF.
- Historial dinámico de transacciones.
- Gráfico de cantidad de transacciones por tipo con Chart.js.
