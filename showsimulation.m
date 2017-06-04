clc; clf; clear all; close all;

data0 = dlmread('0.tsv', '\t', 2, 0);
data1 = dlmread('1.tsv', '\t', 2, 0);
data2 = dlmread('2.tsv', '\t', 2, 0);
data3 = dlmread('3.tsv', '\t', 2, 0);
data4 = dlmread('4.tsv', '\t', 2, 0);
data5 = dlmread('5.tsv', '\t', 2, 0);
data6 = dlmread('6.tsv', '\t', 2, 0);
data7 = dlmread('7.tsv', '\t', 2, 0);

hold on
plot(data0(:,1), data0(:,2))
plot(data1(:,1), data1(:,2))
plot(data2(:,1), data2(:,2))
plot(data3(:,1), data3(:,2))
plot(data4(:,1), data4(:,2))
plot(data5(:,1), data5(:,2))
plot(data6(:,1), data6(:,2))
plot(data7(:,1), data7(:,2))

ylabel('Output concentration [nM]');
legend('0 nM input 1, 0 nM input 2, 0 nM input 3', '0 nM input 1, 0 nM input 2, 1 nM input 3','0 nM input 1, 1 nM input 2, 0 nM input 3', '0 nM input 1, 1 nM input 2, 1 nM input 3','1 nM input 1, 0 nM input 2, 0 nM input 3','1 nM input 1, 0 nM input 2, 1 nM input 3','1 nM input 1, 1 nM input 2, 0 nM input 3','1 nM input 1, 1 nM input 2, 1 nM input 3','Location', 'southeast')
xlabel('Time [s]');

saveas(gcf, 'or_1_simulation_3input.png');