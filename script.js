// Historical inflation data for Indonesia (approximate values)
const inflationData = {
    1970: 15.5, 1971: 4.2, 1972: 6.5, 1973: 31.0, 1974: 40.6, 1975: 19.1, 1976: 19.8, 1977: 11.0, 1978: 8.1, 1979: 20.5,
    1980: 18.5, 1981: 12.2, 1982: 9.5, 1983: 11.8, 1984: 10.5, 1985: 4.7, 1986: 5.8, 1987: 9.3, 1988: 8.0, 1989: 6.4,
    1990: 7.8, 1991: 9.4, 1992: 7.5, 1993: 9.7, 1994: 8.5, 1995: 9.4, 1996: 8.0, 1997: 6.2, 1998: 58.4, 1999: 20.5,
    2000: 3.7, 2001: 11.5, 2002: 11.9, 2003: 6.6, 2004: 6.1, 2005: 10.5, 2006: 13.1, 2007: 6.4, 2008: 11.1, 2009: 2.8,
    2010: 6.9, 2011: 3.8, 2012: 4.3, 2013: 8.4, 2014: 8.4, 2015: 3.4, 2016: 3.0, 2017: 3.6, 2018: 3.1, 2019: 2.7,
    2020: 1.7, 2021: 1.6, 2022: 4.2, 2023: 3.6
};

// Global variables
let inflationChart;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    createInflationChart();
    setupEventListeners();
    performInitialCalculation();
});

// Setup event listeners
function setupEventListeners() {
    const calculateBtn = document.getElementById('calculate-btn');
    const inputs = document.querySelectorAll('input');
    
    calculateBtn.addEventListener('click', calculateInflation);
    
    inputs.forEach(input => {
        input.addEventListener('input', validateInputs);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateInflation();
            }
        });
    });
}

// Validate inputs in real-time
function validateInputs() {
    const amount = parseFloat(document.getElementById('initial-amount').value);
    const initialYear = parseInt(document.getElementById('initial-year').value);
    const targetYear = parseInt(document.getElementById('target-year').value);
    const calculateBtn = document.getElementById('calculate-btn');
    
    if (amount > 0 && initialYear && targetYear && initialYear < targetYear) {
        calculateBtn.disabled = false;
        calculateBtn.classList.remove('loading');
    } else {
        calculateBtn.disabled = true;
        calculateBtn.classList.add('loading');
    }
}

// Perform initial calculation with default values
function performInitialCalculation() {
    setTimeout(() => {
        calculateInflation();
    }, 500);
}

// Main calculation function
function calculateInflation() {
    const initialAmount = parseFloat(document.getElementById('initial-amount').value);
    const initialYear = parseInt(document.getElementById('initial-year').value);
    const targetYear = parseInt(document.getElementById('target-year').value);
    
    // Validate inputs
    if (!initialAmount || !initialYear || !targetYear) {
        showError('Mohon lengkapi semua field input');
        return;
    }
    
    if (initialYear >= targetYear) {
        showError('Tahun target harus lebih besar dari tahun awal');
        return;
    }
    
    if (initialYear < 1970 || targetYear > 2023) {
        showError('Tahun harus antara 1970-2023');
        return;
    }
    
    // Calculate cumulative inflation
    let cumulativeInflation = 1;
    const yearlyInflations = [];
    
    for (let year = initialYear; year < targetYear; year++) {
        const inflationRate = inflationData[year] || 5; // Default 5% if data not available
        const inflationMultiplier = 1 + (inflationRate / 100);
        cumulativeInflation *= inflationMultiplier;
        yearlyInflations.push(inflationRate);
    }
    
    // Calculate results
    const currentValue = initialAmount * cumulativeInflation;
    const totalInflationPercent = (cumulativeInflation - 1) * 100;
    const averageInflation = yearlyInflations.reduce((a, b) => a + b, 0) / yearlyInflations.length;
    
    // Update display
    updateResults(initialAmount, currentValue, totalInflationPercent, averageInflation, initialYear, targetYear);
    updateChart(initialYear, targetYear);
}

// Update results display
function updateResults(initialAmount, currentValue, totalInflation, averageInflation, initialYear, targetYear) {
    document.getElementById('initial-value').textContent = formatCurrency(initialAmount);
    document.getElementById('current-value').textContent = formatCurrency(currentValue);
    document.getElementById('total-inflation').textContent = `${totalInflation.toFixed(1)}%`;
    document.getElementById('average-inflation').textContent = `${averageInflation.toFixed(1)}%`;
    
    // Update explanation
    const explanationText = document.getElementById('explanation-text');
    const yearDiff = targetYear - initialYear;
    const purchasingPowerLoss = ((currentValue - initialAmount) / initialAmount * 100).toFixed(1);
    
    explanationText.innerHTML = `
        <strong>Uang sebesar ${formatCurrency(initialAmount)} di tahun ${initialYear} 
        setara dengan ${formatCurrency(currentValue)} di tahun ${targetYear}.</strong><br><br>
        
        Dalam periode ${yearDiff} tahun, inflasi rata-rata adalah ${averageInflation.toFixed(1)}% per tahun.
        Ini berarti daya beli uang Anda telah ${purchasingPowerLoss > 0 ? 'menurun' : 'meningkat'} sebesar ${Math.abs(purchasingPowerLoss).toFixed(1)}%.
        
        <br><br>
        <em>Contoh: Jika Anda bisa membeli 1 kg beras dengan ${formatCurrency(initialAmount)} di tahun ${initialYear}, 
        maka Anda membutuhkan ${formatCurrency(currentValue)} untuk membeli 1 kg beras yang sama di tahun ${targetYear}.</em>
    `;
    
    // Add visual feedback
    const resultsSection = document.getElementById('results-section');
    resultsSection.classList.add('success');
    setTimeout(() => {
        resultsSection.classList.remove('success');
    }, 1000);
}

// Format currency in Indonesian Rupiah
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Show error message
function showError(message) {
    const explanationText = document.getElementById('explanation-text');
    explanationText.innerHTML = `<span style="color: #dc3545;">⚠️ ${message}</span>`;
}

// Create the inflation chart
function createInflationChart() {
    const ctx = document.getElementById('inflation-chart').getContext('2d');
    
    const years = Object.keys(inflationData).map(year => parseInt(year));
    const rates = Object.values(inflationData);
    
    inflationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Tingkat Inflasi (%)',
                data: rates,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 5,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `Inflasi ${context.parsed.x}: ${context.parsed.y.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tahun',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Tingkat Inflasi (%)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    beginAtZero: true
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Update chart to highlight selected period
function updateChart(startYear, endYear) {
    const years = Object.keys(inflationData).map(year => parseInt(year));
    const rates = Object.values(inflationData);
    
    // Create colors array to highlight selected period
    const colors = years.map(year => {
        if (year >= startYear && year < endYear) {
            return 'rgba(220, 53, 69, 0.8)'; // Red for selected period
        }
        return 'rgba(102, 126, 234, 0.3)'; // Default blue
    });
    
    inflationChart.data.datasets[0].pointBackgroundColor = colors;
    inflationChart.data.datasets[0].pointBorderColor = colors.map(color => 
        color.includes('220') ? '#dc3545' : '#667eea'
    );
    inflationChart.data.datasets[0].pointRadius = years.map(year => 
        (year >= startYear && year < endYear) ? 4 : 2
    );
    
    inflationChart.update();
}

// Add some utility functions for better UX
function addLoadingState() {
    const calculateBtn = document.getElementById('calculate-btn');
    calculateBtn.textContent = 'Menghitung...';
    calculateBtn.disabled = true;
    
    setTimeout(() => {
        calculateBtn.textContent = 'Hitung Inflasi';
        calculateBtn.disabled = false;
    }, 800);
}

// Add real-time calculation on input change
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(calculateInflation, 1000));
    });
});

// Debounce function to avoid too many calculations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 