using Microsoft.EntityFrameworkCore;
using PassIn.Communication.Responses;
using PassIn.Exceptions;
using PassIn.Infrastructure;

namespace PassIn.Application.UseCases.Attendees.GetAllByEventId
{
    public class GetAllAttendeeByEventIdUseCase
    {
        private readonly PassInDbContext _dbContext;

        public GetAllAttendeeByEventIdUseCase()
        {
            _dbContext = new PassInDbContext();
        }

        public ResponseAllAttendeesJson Execute(Guid eventId, string? search, int? pageIndex)
        {
            var entity = _dbContext.Events.Include(ev => ev.Attendees).ThenInclude(at => at.CheckIn).FirstOrDefault(ev => ev.Id == eventId);

            if (entity is null) throw new NotFoundException("Event not found");

            var attendees = entity.Attendees;

            var total = entity.Attendees.Count;

            if (!string.IsNullOrEmpty(search))
            {
                attendees = attendees.Where(at => at.Name.Contains(search, StringComparison.CurrentCultureIgnoreCase)).ToList();
                total = attendees.Count;
            }

            if (pageIndex.HasValue)
            {
                attendees = attendees.Skip(pageIndex.Value * 10).Take(10).ToList();
            }
            else
            {
                attendees = attendees.Take(10).ToList();
            }

            return new ResponseAllAttendeesJson
            {
                Attendees = attendees.Select(at => new ResponseAttendeeJson
                {
                    Id = at.Id,
                    Name = at.Name,
                    Email = at.Email,
                    CreatedAt = at.Created_At,
                    CheckedInAt = at.CheckIn?.Created_at
                }).ToList(),
                Total = total
            };
        }
    }
}
