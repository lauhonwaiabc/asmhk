/* ASM 2027 data component — Stamp Collection slots and per-session QR codes
   One slot = one parallel timeslot. Every symposium, session and workshop
   has its own QR code. Several sessions can belong to the same slot; the
   Stamp Collection counts each slot once, so scanning two rooms in the same
   slot does not add a second stamp.
   Lunch symposia, ceremonies and the Day 0 pre-conference workshops are
   not part of the eight-slot Stamp Collection. */
window.ASM_DATA_SLOTS = {
  "attendance": {
    "required": 7,
    "total": 8,
    "reward": "Complimentary ASM 2027 souvenir",
    "title": "ASM 2027 Stamp Collection",
    "instructions": [
      "Scan the QR code for the session, symposium or workshop you are attending.",
      "Every session has its own code, but parallel sessions in the same slot count as one stamp.",
      "There are eight eligible slots across Day 1 and Day 2. Lunch symposia and ceremonies are excluded.",
      "Collect at least 7 of the 8 slot stamps to claim your souvenir at the souvenir desk."
    ],
    "slots": [
      {
        "id": "d1s1",
        "day": "day1",
        "date": "2027-10-30",
        "label": "Day 1 · Session 1",
        "time": "09:00–10:30",
        "start": "09:00",
        "end": "10:30",
        "sessions": [
          { "id": "plen", "title": "Plenary Session", "room": "Crystal Court II", "code": "K7Q2" },
          { "id": "nurs", "title": "Nursing Symposium", "room": "Crystal Court I", "code": "R4T8" },
          { "id": "w-ksl", "title": "Kids Save Life Workshop", "room": "Salon 3–4", "code": "H2M6" }
        ]
      },
      {
        "id": "d1s2",
        "day": "day1",
        "date": "2027-10-30",
        "label": "Day 1 · Session 2",
        "time": "11:00–12:30",
        "start": "11:00",
        "end": "12:30",
        "sessions": [
          { "id": "ai", "title": "Bioinformatics and Artificial Intelligence Symposium", "room": "Crystal Court II", "code": "M4X8" },
          { "id": "educ", "title": "Education, Leadership and Communication Symposium", "room": "Crystal Court I", "code": "P3N9" },
          { "id": "fprj", "title": "Formal Project Prize Session", "room": "Salon 3–4", "code": "W7C2" }
        ]
      },
      {
        "id": "d1s3",
        "day": "day1",
        "date": "2027-10-30",
        "label": "Day 1 · Session 3",
        "time": "14:00–15:30",
        "start": "14:00",
        "end": "15:30",
        "sessions": [
          { "id": "peri", "title": "Perioperative Medicine Symposium", "room": "Crystal Court II", "code": "R9P3" },
          { "id": "neur", "title": "Neuroanaesthesia Symposium", "room": "Crystal Court I", "code": "V2B7" },
          { "id": "epos", "title": "e-Poster Evaluation Session", "room": "Pre-function area", "code": "F5J8" },
          { "id": "w-lead", "title": "Medicolegal and Communication Workshop", "room": "Salon 3–4", "code": "D6K4" }
        ]
      },
      {
        "id": "d1s4",
        "day": "day1",
        "date": "2027-10-30",
        "label": "Day 1 · Session 4",
        "time": "16:00–17:30",
        "start": "16:00",
        "end": "17:30",
        "sessions": [
          { "id": "medl", "title": "Medicolegal Symposium", "room": "Crystal Court I", "code": "T2W6" },
          { "id": "w-game", "title": "Anaesthesia Game Workshop", "room": "Salon 3–4", "code": "L8Q3" }
        ]
      },
      {
        "id": "d2s5",
        "day": "day2",
        "date": "2027-10-31",
        "label": "Day 2 · Session 5",
        "time": "09:00–10:30",
        "start": "09:00",
        "end": "10:30",
        "sessions": [
          { "id": "sahk", "title": "SAHK Plenary Session", "room": "Crystal Court II", "code": "H5N7" },
          { "id": "icu", "title": "Critical Care and Trauma Symposium", "room": "Crystal Court I", "code": "S3Y9" },
          { "id": "w-ai", "title": "Agentic AI Workshop", "room": "Salon 1–2", "code": "G4D2" },
          { "id": "w-airw", "title": "Airway Workshop", "room": "Salon 3–4", "code": "J7P6" }
        ]
      },
      {
        "id": "d2s6",
        "day": "day2",
        "date": "2027-10-31",
        "label": "Day 2 · Session 6",
        "time": "11:00–12:30",
        "start": "11:00",
        "end": "12:30",
        "sessions": [
          { "id": "cts", "title": "Cardiothoracic Anaesthesia Symposium", "room": "Crystal Court II", "code": "C8V4" },
          { "id": "pain", "title": "Pain Medicine Symposium", "room": "Crystal Court I", "code": "N6R3" },
          { "id": "fpap", "title": "Free Paper Presentation Session", "room": "Salon 1–2", "code": "Z2T9" },
          { "id": "w-reg2", "title": "Regional Anaesthesia Workshop", "room": "Salon 3–4", "code": "B5H8" }
        ]
      },
      {
        "id": "d2s7",
        "day": "day2",
        "date": "2027-10-31",
        "label": "Day 2 · Session 7",
        "time": "14:00–15:30",
        "start": "14:00",
        "end": "15:30",
        "sessions": [
          { "id": "reg", "title": "Regional Anaesthesia Symposium", "room": "Crystal Court II", "code": "B3J9" },
          { "id": "airw", "title": "Airway Symposium", "room": "Crystal Court I", "code": "X7M4" },
          { "id": "w-debt", "title": "Pro-Con Debate", "room": "Salon 1–2", "code": "K9F2" },
          { "id": "w-echo", "title": "Echocardiogram Workshop", "room": "Salon 3–4", "code": "Q4C7" }
        ]
      },
      {
        "id": "d2s8",
        "day": "day2",
        "date": "2027-10-31",
        "label": "Day 2 · Session 8",
        "time": "16:00–17:30",
        "start": "16:00",
        "end": "17:30",
        "sessions": [
          { "id": "obs", "title": "Obstetric Anaesthesia Symposium", "room": "Crystal Court II", "code": "L6F2" },
          { "id": "paed", "title": "Paediatric Anaesthesia Symposium", "room": "Crystal Court I", "code": "A8V5" },
          { "id": "w-rt", "title": "Round-Table Discussion", "room": "Salon 1–2", "code": "U3N7" },
          { "id": "w-pocu", "title": "POCUS & Haemodynamic Monitoring Workshop", "room": "Salon 3–4", "code": "E9S4" }
        ]
      }
    ]
  }
};
