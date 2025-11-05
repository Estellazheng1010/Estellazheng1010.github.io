const fs = require('fs');
const path = require('path');

hexo.extend.tag.register('accounting', function(args, content){
  const dataPath = path.join(hexo.source_dir, '_data', 'accounting.json');
  let records;
  try {
    records = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (e) {
    return '<p>暂无记账数据</p>';
  }

  let html = `
  <div class="accounting-widget">
    <div class="accounting-filters">
      <select id="filter-year">
        <option value="">全部年份</option>
      </select>
      <select id="filter-month">
        <option value="">全部月份</option>
      </select>
      <select id="filter-day">
        <option value="">全部日期</option>
      </select>
      <!-- 1. 新增分类筛选下拉框 -->
      <select id="filter-category">
        <option value="">全部分类</option>
      </select>
      <button id="filter-reset">重置</button>
    </div>
    <div class="accounting-stats" id="accounting-stats">
    </div>
    <table class="accounting-table">
      <thead>
        <tr><th>日期</th><th>类别</th><th>金额</th><th>备注</th></tr>
      </thead>
      <tbody id="accounting-tbody">
      </tbody>
    </table>
  </div>
  <script>
    window.accountingData = ${JSON.stringify(records)};

    document.addEventListener('DOMContentLoaded', function () {
      const data = window.accountingData;
      if (!data || data.length === 0) {
        document.getElementById('accounting-stats').innerHTML = '<p>暂无记账数据</p>';
        return;
      }

      const yearSelect = document.getElementById('filter-year');
      const monthSelect = document.getElementById('filter-month');
      const daySelect = document.getElementById('filter-day');
      // 2. 获取新增的分类下拉框元素
      const categorySelect = document.getElementById('filter-category');
      const resetButton = document.getElementById('filter-reset');
      const statsContainer = document.getElementById('accounting-stats');
      const tbodyContainer = document.getElementById('accounting-tbody');

      const years = new Set();
      const months = new Set();
      const days = new Set();
      // 3. 新增一个Set来存储分类
      const categories = new Set();

      data.forEach(record => {
        const [year, month, day] = record.date.split('-');
        years.add(year);
        months.add(month);
        days.add(day);
        // 4. 提取所有分类
        categories.add(record.category);
      });

      [...years].sort().forEach(year => {
        yearSelect.innerHTML += \`<option value="\${year}">\${year}</option>\`;
      });
      [...months].sort((a, b) => a - b).forEach(month => {
        monthSelect.innerHTML += \`<option value="\${month}">\${month}月</option>\`;
      });
      [...days].sort((a, b) => a - b).forEach(day => {
        daySelect.innerHTML += \`<option value="\${day}">\${day}日</option>\`;
      });
      // 5. 填充分类下拉框选项（按字母顺序排序）
      [...categories].sort().forEach(category => {
        categorySelect.innerHTML += \`<option value="\${category}">\${category}</option>\`;
      });

      function filterAndRender() {
        const selectedYear = yearSelect.value;
        const selectedMonth = monthSelect.value;
        const selectedDay = daySelect.value;
        // 6. 获取选中的分类
        const selectedCategory = categorySelect.value;

        const filteredData = data.filter(record => {
          const [year, month, day] = record.date.split('-');
          const yearMatch = !selectedYear || year === selectedYear;
          const monthMatch = !selectedMonth || month === selectedMonth;
          const dayMatch = !selectedDay || day === selectedDay;
          // 7. 增加分类匹配逻辑
          const categoryMatch = !selectedCategory || record.category === selectedCategory;
          return yearMatch && monthMatch && dayMatch && categoryMatch;
        });

        let totalIncome = 0;
        let totalExpense = 0;
        filteredData.forEach(record => {
          if (record.type === 'income') {
            totalIncome += record.amount;
          } else {
            totalExpense += Math.abs(record.amount);
          }
        });
        const balance = totalIncome - totalExpense;

        statsContainer.innerHTML = \`
          <span>总收入: <strong>\${totalIncome.toFixed(2)}</strong></span>
          <span>总支出: <strong style="color: red;">\${totalExpense.toFixed(2)}</strong></span>
          <span>结余: <strong style="color: \${balance >= 0 ? 'green' : 'red'}">\${balance.toFixed(2)}</strong></span>
        \`;

        tbodyContainer.innerHTML = '';
        if (filteredData.length === 0) {
          tbodyContainer.innerHTML = '<tr><td colspan="4" style="text-align:center;">没有符合条件的记录</td></tr>';
        } else {
          filteredData.forEach(record => {
            tbodyContainer.innerHTML += \`
              <tr>
                <td>\${record.date}</td>
                <td>\${record.category}</td>
                <td style="color: \${record.type === 'income' ? 'green' : 'red'}">\${record.amount.toFixed(2)}</td>
                <td>\${record.note}</td>
              </tr>
            \`;
          });
        }
      }

      yearSelect.addEventListener('change', filterAndRender);
      monthSelect.addEventListener('change', filterAndRender);
      daySelect.addEventListener('change', filterAndRender);
      // 8. 为分类下拉框绑定事件
      categorySelect.addEventListener('change', filterAndRender);
      resetButton.addEventListener('click', () => {
        yearSelect.value = '';
        monthSelect.value = '';
        daySelect.value = '';
        // 9. 重置分类筛选器
        categorySelect.value = '';
        filterAndRender();
      });

      filterAndRender();
    });
  </script>
  `;
  return html;
}, {async: true, ends: false});

