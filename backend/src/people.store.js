let nextId = 1;
const people = []; // {id, first_name, last_name, note}

export function listPeople() {
  return people.slice().reverse();
}

export function createPerson({ first_name, last_name, note }) {
  if (!first_name?.trim() || !last_name?.trim()) {
    const e = new Error("first_name and last_name are required");
    e.status = 400; throw e;
  }
  const p = { id: nextId++, first_name: first_name.trim(), last_name: last_name.trim(), note: (note ?? "").trim() };
  people.push(p);
  return p;
}