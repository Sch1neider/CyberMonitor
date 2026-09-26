export async function getSecurityEvents() {

    const response =
        await fetch("../../data/events.json");

    if (!response.ok) {

        throw new Error(
            "Não foi possível carregar os eventos"
        );

    }

    const events =
        await response.json();

    return events;
}