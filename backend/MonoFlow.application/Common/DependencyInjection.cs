using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Reflection;

namespace MonoFlow.application.Common
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddCommandValidators(this IServiceCollection services, Assembly assembly)
        {
            var validatorInterface = typeof(ICommandValidator<>);

            var types = assembly.GetTypes()
                .Where(t => !t.IsAbstract && !t.IsInterface)
                .SelectMany(t => t.GetInterfaces(), (t, i) => new { Implementation = t, Interface = i })
                .Where(x => x.Interface.IsGenericType && x.Interface.GetGenericTypeDefinition() == validatorInterface);

            foreach (var type in types)
            {
                services.AddScoped(type.Interface, type.Implementation);
            }

            return services;
        }
    }
}
