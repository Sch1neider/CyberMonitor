import {
    getSecurityEvents
} from "./repositories/eventRepository.js";


let securityEvents = [];


// análise dos eventos

function analyzeEvents(events) {

    const totalEvents =
        events.length;

    const criticalEvents =
        events.filter(
            event => event.severity == "CRITICAL"
        );

    const highSeverityEvents =
        events.filter(
            event => event.severity == "HIGH"
        );

    const openEvents =
        events.filter(
            event => event.status == "OPEN"
        );

    const investigatingEvents =
        events.filter(
            event => event.status == "INVESTIGATING"
        );

    const resolvedEvents =
        events.filter(
            event => event.status == "RESOLVED"
        );

    return {
        totalEvents,
        criticalEvents,
        highSeverityEvents,
        openEvents,
        investigatingEvents,
        resolvedEvents
    };
}


// agrupamento dos eventos

function groupBy(events, property) {

    return events.reduce(
        (result, event) => {

            const key =
                event[property];

            result[key] =
                (result[key] || 0) + 1;

            return result;

        },
        {}
    );
}


// atualização das métricas

function renderMetrics(events) {

    const analysis =
        analyzeEvents(events);

    document.querySelector(
        "#total-events"
    ).textContent =
        analysis.totalEvents;

    document.querySelector(
        "#critical-events"
    ).textContent =
        analysis.criticalEvents.length;

    document.querySelector(
        "#high-events"
    ).textContent =
        analysis.highSeverityEvents.length;

    document.querySelector(
        "#investigating-events"
    ).textContent =
        analysis.investigatingEvents.length;

    document.querySelector(
        "#open-events"
    ).textContent =
        analysis.openEvents.length;

    document.querySelector(
        "#investigating-status"
    ).textContent =
        analysis.investigatingEvents.length;

    document.querySelector(
        "#resolved-events"
    ).textContent =
        analysis.resolvedEvents.length;

    document.querySelector(
        "#event-count"
    ).textContent =
        analysis.totalEvents + " eventos";
}


// gráfico de severidade

function renderSeverityChart(events) {

    const container =
        document.querySelector(
            "#severity-chart"
        );

    const eventsBySeverity =
        groupBy(
            events,
            "severity"
        );

    const severities = [
        "CRITICAL",
        "HIGH",
        "MEDIUM",
        "LOW"
    ];

    const values =
        Object.values(
            eventsBySeverity
        );

    const maxValue =
        values.length > 0
            ? Math.max(...values)
            : 0;

    container.innerHTML = "";

    severities.forEach(
        severity => {

            const value =
                eventsBySeverity[severity] || 0;

            const percentage =
                maxValue == 0
                    ? 0
                    : (value / maxValue) * 100;

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "bar-item";

            item.innerHTML = `

                <span class="bar-label">
                    ${severity}
                </span>

                <div class="bar-wrapper">

                    <div
                        class="bar bar-${severity.toLowerCase()}"
                        style="width: ${percentage}%"
                    ></div>

                </div>

                <span class="bar-value">
                    ${value}
                </span>

            `;

            container.appendChild(item);

        }
    );
}


// gráfico de tipos

function renderTypeChart(events) {

    const container =
        document.querySelector(
            "#type-chart"
        );

    const eventsByType =
        groupBy(
            events,
            "type"
        );

    const entries =
        Object.entries(
            eventsByType
        ).sort(
            (a, b) => b[1] - a[1]
        );

    const values =
        Object.values(
            eventsByType
        );

    const maxValue =
        values.length > 0
            ? Math.max(...values)
            : 0;

    container.innerHTML = "";

    entries.forEach(
        ([type, value]) => {

            const percentage =
                maxValue == 0
                    ? 0
                    : (value / maxValue) * 100;

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "bar-item";

            item.innerHTML = `

                <span class="bar-label">
                    ${type}
                </span>

                <div class="bar-wrapper">

                    <div
                        class="bar bar-default"
                        style="width: ${percentage}%"
                    ></div>

                </div>

                <span class="bar-value">
                    ${value}
                </span>

            `;

            container.appendChild(item);

        }
    );
}


// protocolos

function renderProtocolChart(events) {

    const container =
        document.querySelector(
            "#protocol-chart"
        );

    const eventsByProtocol =
        groupBy(
            events,
            "protocol"
        );

    const entries =
        Object.entries(
            eventsByProtocol
        ).sort(
            (a, b) => b[1] - a[1]
        );

    container.innerHTML = "";

    entries.forEach(
        ([protocol, value]) => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "protocol-item";

            item.innerHTML = `

                <span class="protocol-name">
                    ${protocol}
                </span>

                <span class="protocol-value">
                    ${value} eventos
                </span>

            `;

            container.appendChild(item);

        }
    );
}


// tabela de eventos

function renderEventsTable(events) {

    const table =
        document.querySelector(
            "#events-table"
        );

    table.innerHTML = "";

    events.forEach(
        event => {

            const row =
                document.createElement(
                    "tr"
                );

            const timestamp =
                new Date(
                    event.timestamp
                ).toLocaleString(
                    "pt-BR"
                );

            row.innerHTML = `

                <td>
                    #${event.id}
                </td>

                <td>
                    ${timestamp}
                </td>

                <td>
                    ${event.type}
                </td>

                <td class="ip">
                    ${event.sourceIP}
                </td>

                <td class="ip">
                    ${event.destinationIP}
                </td>

                <td>
                    ${event.protocol}
                </td>

                <td>

                    <span
                        class="badge badge-${event.severity.toLowerCase()}"
                    >
                        ${event.severity}
                    </span>

                </td>

                <td>

                    <span
                        class="badge badge-${event.status.toLowerCase()}"
                    >
                        ${event.status}
                    </span>

                </td>

            `;

            table.appendChild(row);

        }
    );
}


// inicialização do dashboard

function initializeDashboard(events) {

    renderMetrics(events);

    renderSeverityChart(events);

    renderTypeChart(events);

    renderProtocolChart(events);

    renderEventsTable(events);
}


// inicialização da aplicação

async function startApplication() {

    try {

        securityEvents =
            await getSecurityEvents();

        initializeDashboard(
            securityEvents
        );

    } catch (error) {

        console.error(
            "Erro ao iniciar o CyberMonitor:",
            error
        );

    }
}


startApplication();