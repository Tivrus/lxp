class Visa {
    private _country: string;
    private _isValid: boolean;
    private _year: number;

    constructor() {
        const countries = ["Арстоцка", "Колечия", "Орбистан"];
        this._country = countries[Math.floor(Math.random() * countries.length)];
        this._isValid = Math.random() < 0.5;
        this._year = 2000 + Math.floor(Math.random() * 51);
    }


    get Country(): string {
        return this._country;
    }

    get IsValid(): boolean {
        return this._isValid;
    }

    get Year(): number {
        return this._year;
    }

    ShowInfo(): void {
        console.log(`Страна: ${this._country}, Валидна: ${this._isValid}, Год выдачи: ${this._year}`);
    }
}

class BorderGuard {
    CheckVisa(visa: Visa): string {
        if (visa.Country !== "Арстоцка" && visa.Country !== "Орбистан") {
            return "Враждебная страна";
        }

        if (!visa.IsValid) {
            return "ПОДДЕЛКА!";
        }

        const currentYear = new Date().getFullYear();
        if (visa.Year < currentYear - 5 || visa.Year > currentYear) {
            return "Некорректный год";
        }

        return "Въезд разрешен";
    }
}

function Main(): void {
    const visas: Visa[] = [];
    for (let i = 0; i < 5; i++) {
        visas.push(new Visa());
    }

    const guard = new BorderGuard();

    visas.forEach((visa, index) => {
        console.log(`\nВиза ${index + 1}:`);
        visa.ShowInfo();
        console.log(`Результат проверки: ${guard.CheckVisa(visa)}`);
    });
}

Main();