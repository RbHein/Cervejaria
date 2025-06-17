document.addEventListener('DOMContentLoaded', function() {
    // Botão Gerar Relatório
    document.getElementById('generate-report').addEventListener('click', function() {
        const year = document.getElementById('report-year').value;
        loadReportData(year);
    });
    
    // Carrega os dados iniciais
    loadReportData('2024');
});

function loadReportData(year) {
    console.log(`Carregando dados para o ano ${year}`);

    const tableBody = document.querySelector('.production-report tbody');
    tableBody.innerHTML = '<tr><td colspan="9" class="loading">Carregando dados...</td></tr>';

    setTimeout(() => {
        const sampleData = [
            { month: 'Janeiro', pilsen: 1, pilsenValue: 1, ipa: 1, ipaValue: 1, viena: 1, vienaValue: 1 },
            { month: 'Fevereiro', pilsen: 1, pilsenValue: 1, ipa: 1, ipaValue: 1, viena: 1, vienaValue: 1 },
            { month: 'Fevereiro', pilsen: 1, pilsenValue: 1, ipa: 1, ipaValue: 1, viena: 1, vienaValue: 1 },
            { month: 'Março', pilsen: 1, pilsenValue: 1, ipa: 1, ipaValue: 1, viena: 1, vienaValue: 1 },
            { month: 'Abril', pilsen: 1, pilsenValue: 1, ipa: 1, ipaValue: 1, viena: 1, vienaValue: 1 },
            { month: 'Maio', pilsen: 1, pilsenValue: 1, ipa: 1, ipaValue: 1, viena: 1, vienaValue: 1 },
            { month: 'Junho', pilsen: 1, pilsenValue: 1, ipa: 1, ipaValue: 1, viena: 1, vienaValue: 1 },
            { month: 'Julho', pilsen: 1, pilsenValue: 1, ipa: 1, ipaValue: 1, viena: 1, vienaValue: 1 },
            { month: 'Agosto', pilsen: 1, pilsenValue: 1, ipa: 1, ipaValue: 1, viena: 1, vienaValue: 1 },
            { month: 'Setembro', pilsen: 1, pilsenValue: 1, ipa: 1, ipaValue: 1, viena: 1, vienaValue: 1 },
            { month: 'Outubro', pilsen: 1, pilsenValue: 1, ipa: 1, ipaValue: 1, viena: 1, vienaValue: 1 },
            { month: 'Novembro', pilsen: 1, pilsenValue: 1, ipa: 1, ipaValue: 1, viena: 1, vienaValue: 1 },
            { month: 'Dezembro', pilsen: 1, pilsenValue: 1, ipa: 1, ipaValue: 1, viena: 1, vienaValue: 1 },
        ];

        renderReportTable(sampleData);
    }, 1000);
}


function renderReportTable(data) {
    const tableBody = document.querySelector('.production-report tbody');
    let html = '';
    let totalPilsen = 0, totalPilsenValue = 0;
    let totalIpa = 0, totalIpaValue = 0;
    let totalViena = 0, totalVienaValue = 0;
    
    data.forEach(item => {
        const monthTotal = item.pilsen + item.ipa + item.viena;
        const monthTotalValue = item.pilsenValue + item.ipaValue + item.vienaValue;
        
        // Acumula totais
        totalPilsen += item.pilsen;
        totalPilsenValue += item.pilsenValue;
        totalIpa += item.ipa;
        totalIpaValue += item.ipaValue;
        totalViena += item.viena;
        totalVienaValue += item.vienaValue;
        
        html += `
            <tr>
                <td>${item.month}</td>
                <td>${item.pilsen.toLocaleString('pt-BR')}</td>
                <td>${item.pilsenValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
                <td>${item.ipa.toLocaleString('pt-BR')}</td>
                <td>${item.ipaValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
                <td>${item.viena.toLocaleString('pt-BR')}</td>
                <td>${item.vienaValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
                <td>${monthTotal.toLocaleString('pt-BR')}</td>
                <td>${monthTotalValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
            </tr>
        `;
    });
    
    // Adiciona linha de totais
    const grandTotal = totalPilsen + totalIpa + totalViena;
    const grandTotalValue = totalPilsenValue + totalIpaValue + totalVienaValue;
    
    html += `
        <tr class="total-row">
            <td><strong>TOTAL</strong></td>
            <td><strong>${totalPilsen.toLocaleString('pt-BR')}</strong></td>
            <td><strong>${totalPilsenValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</strong></td>
            <td><strong>${totalIpa.toLocaleString('pt-BR')}</strong></td>
            <td><strong>${totalIpaValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</strong></td>
            <td><strong>${totalViena.toLocaleString('pt-BR')}</strong></td>
            <td><strong>${totalVienaValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</strong></td>
            <td><strong>${grandTotal.toLocaleString('pt-BR')}</strong></td>
            <td><strong>${grandTotalValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</strong></td>
        </tr>
    `;
    
    tableBody.innerHTML = html;
    
    // Atualiza os cards de resumo
    updateSummaryCards(totalPilsen, totalIpa, totalViena, grandTotal, grandTotalValue);
}

function updateSummaryCards(pilsen, ipa, viena, totalLitros, totalValor) {
    // Determina a cerveja mais vendida
    let topBeer = 'Pilsen';
    let topVolume = pilsen;
    
    if (ipa > topVolume) {
        topBeer = 'IPA';
        topVolume = ipa;
    }
    if (viena > topVolume) {
        topBeer = 'Viena';
        topVolume = viena;
    }
    
    const percentage = ((topVolume / totalLitros) * 100).toFixed(0);
    
    // Atualiza os cards
    document.querySelectorAll('.summary-card')[0].querySelector('.summary-value').textContent = `${totalLitros.toLocaleString('pt-BR')} L`;
    document.querySelectorAll('.summary-card')[1].querySelector('.summary-value').textContent = totalValor.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
    document.querySelectorAll('.summary-card')[2].querySelector('.summary-value').textContent = `${topBeer} (${topVolume.toLocaleString('pt-BR')} L)`;
    document.querySelectorAll('.summary-card')[2].querySelector('.summary-change').textContent = `${percentage}% do total`;
}
